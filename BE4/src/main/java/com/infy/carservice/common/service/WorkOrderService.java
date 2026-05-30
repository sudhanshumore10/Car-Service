package com.infy.carservice.common.service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.dto.AssignTechnicianDTO;
import com.infy.carservice.common.dto.UpdateWorkOrderStatusDTO;
import com.infy.carservice.common.dto.WorkOrderLogDTO;
import com.infy.carservice.common.dto.WorkOrderResponseDTO;
import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.common.entity.WorkOrder;
import com.infy.carservice.common.repository.WorkOrderLogRepository;
import com.infy.carservice.common.repository.WorkOrderRepository;
import com.infy.carservice.exception.InfyCarServiceException;
import com.infy.carservice.parts.entity.Invoice;
import com.infy.carservice.parts.entity.InvoiceItem;
import com.infy.carservice.parts.repository.InvoiceItemRepository;
import com.infy.carservice.parts.repository.InvoiceRepository;
import com.infy.carservice.scheduling.entity.Booking;
import com.infy.carservice.scheduling.repository.BookingRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class WorkOrderService {

    @Autowired private WorkOrderRepository workOrderRepository;
    @Autowired private WorkOrderLogRepository workOrderLogRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private InvoiceItemRepository invoiceItemRepository;
    @PersistenceContext private EntityManager entityManager;

    public WorkOrderResponseDTO createWorkOrder(Long bookingId) {
        ensureWorkflowTable();
        workOrderRepository.findByBookingId(bookingId).ifPresent(wo -> {
            throw new InfyCarServiceException("Work order already exists for booking: " + bookingId);
        });

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new InfyCarServiceException("Booking not found: " + bookingId));

        WorkOrder workOrder = new WorkOrder();
        workOrder.setBooking(booking);
        workOrder.setStatus("SCHEDULED");
        workOrder.setCreatedAt(LocalDateTime.now());
        WorkOrder saved = workOrderRepository.save(workOrder);
        ensureWorkflow(saved.getId());
        logStatusChange(saved, "SCHEDULED");
        return mapToDTO(saved);
    }

    public WorkOrderResponseDTO getWorkOrderById(Long workOrderId) {
        ensureWorkflowTable();
        WorkOrder wo = findWorkOrder(workOrderId);
        ensureWorkflow(workOrderId);
        return mapToDTO(wo);
    }

    public WorkOrderResponseDTO saveFindings(Long workOrderId, Map<String, Object> payload) {
        ensureWorkflowTable();
        WorkOrder wo = findWorkOrder(workOrderId);
        ensureWorkflow(workOrderId);
        String checklist = String.join("|", toStringList(payload == null ? null : payload.get("checklist")));
        String notes = payload == null ? "" : String.valueOf(payload.getOrDefault("notes", ""));
        entityManager.createNativeQuery("""
            update work_order_workflow
            set diagnosis_checklist = ?, diagnosis_notes = ?, updated_at = ?
            where work_order_id = ?
            """)
            .setParameter(1, checklist)
            .setParameter(2, notes)
            .setParameter(3, Timestamp.valueOf(LocalDateTime.now()))
            .setParameter(4, workOrderId)
            .executeUpdate();
        if ("SCHEDULED".equalsIgnoreCase(wo.getStatus()) || "RECEIVED".equalsIgnoreCase(wo.getStatus())) {
            wo.setStatus("DIAGNOSIS");
            workOrderRepository.save(wo);
            logStatusChange(wo, "DIAGNOSIS");
        }
        return mapToDTO(wo);
    }

    public WorkOrderResponseDTO saveEstimate(Long workOrderId, Map<String, Object> payload) {
        ensureWorkflowTable();
        WorkOrder wo = findWorkOrder(workOrderId);
        ensureWorkflow(workOrderId);
        List<Map<String, Object>> items = estimateItemsFrom(payload == null ? null : payload.get("items"));
        if (items.isEmpty()) {
            throw new InfyCarServiceException("Add at least one estimate item.");
        }

        BigDecimal subtotal = items.stream()
            .map(this::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
        BigDecimal discount = subtotal.compareTo(new BigDecimal("5000")) >= 0
            ? subtotal.multiply(new BigDecimal("0.05"))
            : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax).subtract(discount);
        boolean sendToCustomer = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("sendToCustomer", false)));
        String estimateStatus = sendToCustomer ? "SENT" : "DRAFT";
        String approvalStatus = sendToCustomer ? "PENDING" : "DRAFT";
        LocalDateTime now = LocalDateTime.now();

        Invoice invoice = invoiceRepository.findByWorkOrderId(workOrderId).orElseGet(() -> createInvoice(wo));
        invoiceItemRepository.deleteByInvoiceId(invoice.getId());
        for (Map<String, Object> item : items) {
            InvoiceItem invoiceItem = new InvoiceItem();
            invoiceItem.setInvoice(invoice);
            invoiceItem.setDescription(String.valueOf(item.getOrDefault("description", "Estimate item")));
            invoiceItem.setAmount(lineTotal(item));
            invoiceItemRepository.save(invoiceItem);
        }
        invoice.setTotalAmount(total);
        invoice.setStatus("PENDING");
        invoiceRepository.save(invoice);

        Integer nextVersion = currentVersion(workOrderId) + 1;
        entityManager.createNativeQuery("""
            update work_order_workflow
            set estimate_status = ?, approval_status = ?, estimate_subtotal = ?, estimate_tax = ?,
                estimate_discount = ?, estimate_total = ?, estimate_version = ?, estimate_sent_at = ?,
                updated_at = ?
            where work_order_id = ?
            """)
            .setParameter(1, estimateStatus)
            .setParameter(2, approvalStatus)
            .setParameter(3, subtotal)
            .setParameter(4, tax)
            .setParameter(5, discount)
            .setParameter(6, total)
            .setParameter(7, nextVersion)
            .setParameter(8, sendToCustomer ? Timestamp.valueOf(now) : null)
            .setParameter(9, Timestamp.valueOf(now))
            .setParameter(10, workOrderId)
            .executeUpdate();
        logStatusChange(wo, sendToCustomer ? "ESTIMATE_SENT" : "ESTIMATE_DRAFT");
        return mapToDTO(wo);
    }

    public WorkOrderResponseDTO convertApprovedEstimate(Long workOrderId) {
        ensureWorkflowTable();
        WorkOrder wo = findWorkOrder(workOrderId);
        Map<String, Object> workflow = workflow(workOrderId);
        String approvalStatus = stringValue(workflow.get("approval_status"), "PENDING");
        if (!"APPROVED".equalsIgnoreCase(approvalStatus)) {
            throw new InfyCarServiceException("Customer approval is required before converting to job.");
        }
        entityManager.createNativeQuery("""
            update work_order_workflow
            set job_scope_locked = true, updated_at = ?
            where work_order_id = ?
            """)
            .setParameter(1, Timestamp.valueOf(LocalDateTime.now()))
            .setParameter(2, workOrderId)
            .executeUpdate();
        wo.setStatus("IN_SERVICE");
        workOrderRepository.save(wo);
        logStatusChange(wo, "IN_SERVICE");
        return mapToDTO(wo);
    }

    public WorkOrderResponseDTO getCustomerWorkOrderById(Long workOrderId, Long userId) {
        ensureWorkflowTable();
        WorkOrder wo = findCustomerOwnedWorkOrder(workOrderId, userId);
        ensureWorkflow(workOrderId);
        return mapToDTO(wo);
    }

    public WorkOrderResponseDTO recordCustomerApproval(Long workOrderId, Long userId, Map<String, Object> payload) {
        ensureWorkflowTable();
        WorkOrder wo = findCustomerOwnedWorkOrder(workOrderId, userId);
        ensureWorkflow(workOrderId);
        String requestedStatus = payload == null ? "APPROVED" : String.valueOf(payload.getOrDefault("status", "APPROVED"));
        String approvalStatus = "DECLINED".equalsIgnoreCase(requestedStatus) ? "DECLINED" : "APPROVED";
        LocalDateTime now = LocalDateTime.now();
        entityManager.createNativeQuery("""
            update work_order_workflow
            set approval_status = ?, approval_at = ?, updated_at = ?
            where work_order_id = ?
            """)
            .setParameter(1, approvalStatus)
            .setParameter(2, Timestamp.valueOf(now))
            .setParameter(3, Timestamp.valueOf(now))
            .setParameter(4, workOrderId)
            .executeUpdate();
        if ("APPROVED".equals(approvalStatus)) {
            logStatusChange(wo, "ESTIMATE_APPROVED");
        } else {
            wo.setStatus("DIAGNOSIS");
            workOrderRepository.save(wo);
            logStatusChange(wo, "ESTIMATE_DECLINED");
        }
        return mapToDTO(wo);
    }

    public List<WorkOrderResponseDTO> getWorkOrdersByWorkshop(Long workshopId) {
        ensureWorkflowTable();
        return workOrderRepository.findByBookingWorkshopId(workshopId).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<WorkOrderResponseDTO> getWorkOrdersByStatus(Long workshopId, String status) {
        ensureWorkflowTable();
        return workOrderRepository.findByBookingWorkshopIdAndStatus(workshopId, status).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public WorkOrderResponseDTO updateStatus(Long workOrderId, UpdateWorkOrderStatusDTO dto) {
        WorkOrder wo = findWorkOrder(workOrderId);
        validateStatusTransition(wo.getStatus(), dto.getStatus());
        wo.setStatus(dto.getStatus());
        WorkOrder saved = workOrderRepository.save(wo);
        logStatusChange(saved, dto.getStatus());
        return mapToDTO(saved);
    }

    public WorkOrderResponseDTO assignTechnician(Long workOrderId, AssignTechnicianDTO dto) {
        WorkOrder wo = findWorkOrder(workOrderId);
        if ("DELIVERED".equals(wo.getStatus()) || "CLOSED".equals(wo.getStatus())) {
            throw new InfyCarServiceException("Cannot assign technician to DELIVERED or CLOSED work order.");
        }
        Technician tech = new Technician();
        tech.setTechnicianId(dto.getTechnicianId());
        wo.setAssignedTechnician(tech);
        return mapToDTO(workOrderRepository.save(wo));
    }

    public List<WorkOrderResponseDTO> getWorkOrdersByTechnicianUser(Long userId) {
        ensureWorkflowTable();
        return workOrderRepository.findAll().stream()
            .filter(wo -> wo.getAssignedTechnician() != null)
            .filter(wo -> wo.getAssignedTechnician().getUser() != null)
            .filter(wo -> userId.equals(wo.getAssignedTechnician().getUser().getId()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public List<WorkOrderResponseDTO> getOperationalQueue() {
        ensureWorkflowTable();
        return workOrderRepository.findAll().stream()
            .filter(wo -> !"CLOSED".equals(wo.getStatus()))
            .filter(wo -> !"DELIVERED".equals(wo.getStatus()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private WorkOrder findWorkOrder(Long workOrderId) {
        return workOrderRepository.findById(workOrderId)
            .orElseThrow(() -> new InfyCarServiceException("Work order not found: " + workOrderId));
    }

    private WorkOrder findCustomerOwnedWorkOrder(Long workOrderId, Long userId) {
        WorkOrder wo = findWorkOrder(workOrderId);
        Long ownerUserId = null;
        if (wo.getBooking() != null && wo.getBooking().getCustomer() != null
                && wo.getBooking().getCustomer().getUser() != null) {
            ownerUserId = wo.getBooking().getCustomer().getUser().getId();
        }
        if (userId == null || ownerUserId == null || !userId.equals(ownerUserId)) {
            throw new InfyCarServiceException("Work order is not available for this customer.");
        }
        return wo;
    }

    private void validateStatusTransition(String current, String next) {
        List<String> order = List.of("SCHEDULED", "VEHICLE_RECEIVED", "DIAGNOSIS", "IN_SERVICE", "QA", "READY", "DELIVERED", "CLOSED");
        int currentIndex = order.indexOf(current);
        int nextIndex = order.indexOf(next);
        if (nextIndex != currentIndex + 1) {
            throw new InfyCarServiceException("Invalid transition: " + current + " -> " + next);
        }
    }

    private void logStatusChange(WorkOrder wo, String status) {
        com.infy.carservice.common.entity.WorkOrderLog log = new com.infy.carservice.common.entity.WorkOrderLog();
        log.setWorkOrder(wo);
        log.setStatus(status);
        log.setTimestamp(LocalDateTime.now());
        workOrderLogRepository.save(log);
    }

    private WorkOrderResponseDTO mapToDTO(WorkOrder wo) {
        ensureWorkflow(wo.getId());
        Map<String, Object> workflow = workflow(wo.getId());
        List<Map<String, Object>> items = invoiceRepository.findByWorkOrderId(wo.getId())
            .map(invoice -> invoiceItemRepository.findByInvoiceId(invoice.getId()).stream()
                .map(this::estimateItemFromInvoiceItem)
                .collect(Collectors.toList()))
            .orElseGet(ArrayList::new);

        WorkOrderResponseDTO dto = new WorkOrderResponseDTO();
        dto.setWorkOrderId(wo.getId());
        dto.setStatus(wo.getStatus());
        dto.setCreatedAt(wo.getCreatedAt());
        if (wo.getBooking() != null) {
            dto.setBookingId(wo.getBooking().getId());
            if (wo.getBooking().getWorkshop() != null) {
                dto.setWorkshopId(wo.getBooking().getWorkshop().getId());
                dto.setWorkshopName(wo.getBooking().getWorkshop().getName());
            }
            if (wo.getBooking().getCustomer() != null) {
                dto.setCustomerName(wo.getBooking().getCustomer().getFullName());
            }
            if (wo.getBooking().getVehicle() != null) {
                dto.setVehicleMake(wo.getBooking().getVehicle().getMake());
                dto.setVehicleModel(wo.getBooking().getVehicle().getModel());
                dto.setVehiclePlateNumber(wo.getBooking().getVehicle().getPlateNumber());
            }
        }
        if (wo.getAssignedTechnician() != null) {
            dto.setTechnicianId(wo.getAssignedTechnician().getTechnicianId());
            dto.setTechnicianName(wo.getAssignedTechnician().getTechnicianName());
        }

        List<WorkOrderLogDTO> logDTOs = workOrderLogRepository.findByWorkOrderIdOrderByTimestampAsc(wo.getId()).stream().map(l -> {
            WorkOrderLogDTO logDTO = new WorkOrderLogDTO();
            logDTO.setId(l.getId());
            logDTO.setStatus(l.getStatus());
            logDTO.setTimestamp(l.getTimestamp());
            return logDTO;
        }).collect(Collectors.toList());

        BigDecimal subtotal = moneyValue(workflow.get("estimate_subtotal"));
        BigDecimal tax = moneyValue(workflow.get("estimate_tax"));
        BigDecimal discount = moneyValue(workflow.get("estimate_discount"));
        BigDecimal total = moneyValue(workflow.get("estimate_total"));
        Integer version = intValue(workflow.get("estimate_version"));
        String approvalStatus = stringValue(workflow.get("approval_status"), "PENDING");

        dto.setStatusHistory(logDTOs);
        dto.setDiagnosisChecklist(splitChecklist(stringValue(workflow.get("diagnosis_checklist"), "")));
        dto.setDiagnosisNotes(stringValue(workflow.get("diagnosis_notes"), ""));
        dto.setEstimateItems(items);
        dto.setEstimateHistory(buildHistory(version, subtotal, tax, discount, total, stringValue(workflow.get("estimate_status"), "DRAFT"), items));
        dto.setEstimateSubtotal(subtotal);
        dto.setEstimateTax(tax);
        dto.setEstimateDiscount(discount);
        dto.setEstimateTotal(total);
        dto.setEstimateVersion(version);
        dto.setEstimateStatus(stringValue(workflow.get("estimate_status"), "DRAFT"));
        dto.setApprovalStatus(approvalStatus);
        dto.setEstimateSentAt(timeValue(workflow.get("estimate_sent_at")));
        dto.setApprovalAt(timeValue(workflow.get("approval_at")));
        dto.setCanConvertToJob("APPROVED".equalsIgnoreCase(approvalStatus) && !boolValue(workflow.get("job_scope_locked")));
        return dto;
    }

    private void ensureWorkflowTable() {
        entityManager.createNativeQuery("""
            create table if not exists work_order_workflow (
                work_order_id bigint primary key,
                diagnosis_checklist text,
                diagnosis_notes text,
                estimate_status varchar(30) default 'DRAFT',
                approval_status varchar(30) default 'PENDING',
                estimate_subtotal decimal(10,2) default 0.00,
                estimate_tax decimal(10,2) default 0.00,
                estimate_discount decimal(10,2) default 0.00,
                estimate_total decimal(10,2) default 0.00,
                estimate_version int default 0,
                estimate_sent_at datetime null,
                approval_at datetime null,
                job_scope_locked boolean default false,
                updated_at datetime default current_timestamp,
                foreign key (work_order_id) references work_orders(id)
            )
            """).executeUpdate();
    }

    private void ensureWorkflow(Long workOrderId) {
        entityManager.createNativeQuery("""
            insert ignore into work_order_workflow
            (work_order_id, diagnosis_checklist, diagnosis_notes, estimate_status, approval_status, estimate_version, updated_at)
            values (?, '', '', 'DRAFT', 'PENDING', 0, ?)
            """)
            .setParameter(1, workOrderId)
            .setParameter(2, Timestamp.valueOf(LocalDateTime.now()))
            .executeUpdate();
    }

    private Map<String, Object> workflow(Long workOrderId) {
        Object[] row = (Object[]) entityManager.createNativeQuery("""
            select diagnosis_checklist, diagnosis_notes, estimate_status, approval_status,
                   estimate_subtotal, estimate_tax, estimate_discount, estimate_total,
                   estimate_version, estimate_sent_at, approval_at, job_scope_locked
            from work_order_workflow where work_order_id = ?
            """)
            .setParameter(1, workOrderId)
            .getSingleResult();
        Map<String, Object> map = new LinkedHashMap<>();
        String[] keys = {"diagnosis_checklist", "diagnosis_notes", "estimate_status", "approval_status",
            "estimate_subtotal", "estimate_tax", "estimate_discount", "estimate_total",
            "estimate_version", "estimate_sent_at", "approval_at", "job_scope_locked"};
        for (int i = 0; i < keys.length; i++) {
            map.put(keys[i], row[i]);
        }
        return map;
    }

    private Invoice createInvoice(WorkOrder wo) {
        Invoice invoice = new Invoice();
        invoice.setWorkOrder(wo);
        invoice.setTotalAmount(BigDecimal.ZERO);
        invoice.setStatus("PENDING");
        invoice.setCreatedAt(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }

    private List<Map<String, Object>> estimateItemsFrom(Object rawItems) {
        if (!(rawItems instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream()
            .filter(Map.class::isInstance)
            .map(item -> new LinkedHashMap<>((Map<String, Object>) item))
            .collect(Collectors.toList());
    }

    private Map<String, Object> estimateItemFromInvoiceItem(InvoiceItem item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.getId());
        row.put("description", item.getDescription());
        row.put("type", descriptionLooksLikePart(item.getDescription()) ? "PART" : "SERVICE");
        row.put("price", item.getAmount() == null ? BigDecimal.ZERO : item.getAmount());
        row.put("quantity", 1);
        row.put("approved", true);
        return row;
    }

    private boolean descriptionLooksLikePart(String description) {
        String value = description == null ? "" : description.toLowerCase();
        return value.contains("filter") || value.contains("battery") || value.contains("pad") || value.contains("oil");
    }

    private BigDecimal lineTotal(Map<String, Object> item) {
        BigDecimal price = toMoney(item.get("price"));
        BigDecimal qty = toMoney(item.getOrDefault("quantity", 1));
        return price.multiply(qty);
    }

    private BigDecimal toMoney(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }

    private List<String> toStringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream().filter(Objects::nonNull).map(String::valueOf).collect(Collectors.toList());
    }

    private List<String> splitChecklist(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(value.split("\\|")).filter(item -> !item.isBlank()).collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildHistory(Integer version, BigDecimal subtotal, BigDecimal tax,
            BigDecimal discount, BigDecimal total, String status, List<Map<String, Object>> items) {
        if (version == null || version == 0 || items.isEmpty()) {
            return new ArrayList<>();
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("version", version);
        row.put("createdAt", LocalDateTime.now());
        row.put("subtotal", subtotal);
        row.put("tax", tax);
        row.put("discount", discount);
        row.put("total", total);
        row.put("status", status);
        row.put("items", items);
        return List.of(row);
    }

    private int currentVersion(Long workOrderId) {
        Object result = entityManager.createNativeQuery("select estimate_version from work_order_workflow where work_order_id = ?")
            .setParameter(1, workOrderId)
            .getSingleResult();
        return intValue(result);
    }

    private Integer intValue(Object value) {
        if (value == null) {
            return 0;
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private BigDecimal moneyValue(Object value) {
        return value == null ? BigDecimal.ZERO : new BigDecimal(String.valueOf(value));
    }

    private String stringValue(Object value, String fallback) {
        return value == null ? fallback : String.valueOf(value);
    }

    private LocalDateTime timeValue(Object value) {
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        return null;
    }

    private boolean boolValue(Object value) {
        return value != null && ("1".equals(String.valueOf(value)) || Boolean.parseBoolean(String.valueOf(value)));
    }
}
