package com.infy.carservice.parts.controller;

import com.infy.carservice.parts.dto.AddPartToWorkOrderDTO;
import com.infy.carservice.parts.dto.PartResponseDTO;
import com.infy.carservice.parts.dto.WorkOrderPartResponseDTO;
import com.infy.carservice.parts.entity.Invoice;
import com.infy.carservice.parts.entity.InvoiceItem;
import com.infy.carservice.parts.repository.InvoiceItemRepository;
import com.infy.carservice.parts.repository.InvoiceRepository;
import com.infy.carservice.parts.service.PartService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/parts")
public class PartController {

    @Autowired
    private PartService partService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @PersistenceContext
    private EntityManager entityManager;

    
    @GetMapping
    public ResponseEntity<List<PartResponseDTO>> getParts(
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(partService.searchParts(search));
        }
        return ResponseEntity.ok(partService.getAllParts());
    }

  
    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<WorkOrderPartResponseDTO>> getByWorkOrder(
            @PathVariable Long workOrderId) {
        return ResponseEntity.ok(partService.getPartsByWorkOrder(workOrderId));
    }

   
    @PostMapping("/work-order/{workOrderId}")
    public ResponseEntity<WorkOrderPartResponseDTO> addToWorkOrder(
            @PathVariable Long workOrderId,
            @RequestBody AddPartToWorkOrderDTO dto) {
        return ResponseEntity.ok(partService.addPartToWorkOrder(workOrderId, dto));
    }

   
    @DeleteMapping("/work-order-part/{id}")
    public ResponseEntity<Void> removeFromWorkOrder(@PathVariable Long id) {
        partService.removePartFromWorkOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/invoice/work-order/{workOrderId}")
    public ResponseEntity<Map<String, Object>> getInvoiceByWorkOrder(@PathVariable Long workOrderId) {
        Invoice invoice = invoiceRepository.findByWorkOrderId(workOrderId)
            .orElseGet(() -> createEmptyInvoice(workOrderId));
        return ResponseEntity.ok(toInvoiceResponse(invoice));
    }

    @GetMapping("/invoices/customer/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getCustomerInvoices(@PathVariable Long userId) {
        List<Invoice> invoices = invoiceRepository.findAll().stream()
            .filter(invoice -> invoice.getWorkOrder() != null)
            .filter(invoice -> invoice.getWorkOrder().getBooking() != null)
            .filter(invoice -> invoice.getWorkOrder().getBooking().getCustomer() != null)
            .filter(invoice -> invoice.getWorkOrder().getBooking().getCustomer().getUser() != null)
            .filter(invoice -> userId.equals(invoice.getWorkOrder().getBooking().getCustomer().getUser().getId()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(invoices.stream().map(this::toInvoiceResponse).collect(Collectors.toList()));
    }

    @PostMapping("/invoice/{invoiceId}/pay")
    @Transactional
    public ResponseEntity<Map<String, Object>> recordPayment(
            @PathVariable Long invoiceId,
            @RequestBody Map<String, Object> payload) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        BigDecimal amount = toMoney(payload.get("amount"));
        String method = String.valueOf(payload.getOrDefault("method", "UPI"));

        entityManager.createNativeQuery(
                "insert into payments (invoice_id, method, amount, status, paid_at) values (?, ?, ?, 'SUCCESS', ?)")
            .setParameter(1, invoiceId)
            .setParameter(2, method)
            .setParameter(3, amount)
            .setParameter(4, Timestamp.valueOf(LocalDateTime.now()))
            .executeUpdate();

        BigDecimal paid = getPaidAmount(invoiceId);
        BigDecimal total = invoice.getTotalAmount() == null ? BigDecimal.ZERO : invoice.getTotalAmount();
        invoice.setStatus(paid.compareTo(total) >= 0 ? "PAID" : "PENDING");
        invoiceRepository.save(invoice);

        return ResponseEntity.ok(toInvoiceResponse(invoice));
    }

    private Invoice createEmptyInvoice(Long workOrderId) {
        com.infy.carservice.common.entity.WorkOrder workOrder =
            entityManager.find(com.infy.carservice.common.entity.WorkOrder.class, workOrderId);
        if (workOrder == null) {
            throw new RuntimeException("Work order not found: " + workOrderId);
        }
        Invoice invoice = new Invoice();
        invoice.setWorkOrder(workOrder);
        invoice.setTotalAmount(BigDecimal.ZERO);
        invoice.setStatus("PENDING");
        invoice.setCreatedAt(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }

    private Map<String, Object> toInvoiceResponse(Invoice invoice) {
        Map<String, Object> response = new LinkedHashMap<>();
        BigDecimal total = invoice.getTotalAmount() == null ? BigDecimal.ZERO : invoice.getTotalAmount();
        BigDecimal paid = getPaidAmount(invoice.getId());
        BigDecimal balance = total.subtract(paid).max(BigDecimal.ZERO);
        String paymentStatus = paid.compareTo(BigDecimal.ZERO) > 0 && balance.compareTo(BigDecimal.ZERO) > 0
            ? "PARTIALLY_PAID"
            : invoice.getStatus();

        response.put("invoiceId", invoice.getId());
        response.put("workOrderId", invoice.getWorkOrder() != null ? invoice.getWorkOrder().getId() : null);
        response.put("status", invoice.getStatus());
        response.put("paymentStatus", paymentStatus == null ? "PENDING" : paymentStatus);
        response.put("readyForPayment", true);
        response.put("createdAt", invoice.getCreatedAt());
        response.put("subtotal", total);
        response.put("tax", BigDecimal.ZERO);
        response.put("discount", BigDecimal.ZERO);
        response.put("total", total);
        response.put("paidAmount", paid);
        response.put("balanceAmount", balance);
        response.put("customerName", customerName(invoice));
        response.put("vehicle", vehicleName(invoice));
        response.put("lineItems", invoiceItemRepository.findByInvoiceId(invoice.getId()).stream()
            .map(this::toLineItem)
            .collect(Collectors.toList()));
        return response;
    }

    private Map<String, Object> toLineItem(InvoiceItem item) {
        Map<String, Object> row = new LinkedHashMap<>();
        BigDecimal amount = item.getAmount() == null ? BigDecimal.ZERO : item.getAmount();
        row.put("id", item.getId());
        row.put("description", item.getDescription());
        row.put("quantity", 1);
        row.put("unitPrice", amount);
        row.put("tax", BigDecimal.ZERO);
        row.put("lineTotal", amount);
        row.put("type", "PART");
        return row;
    }

    private BigDecimal getPaidAmount(Long invoiceId) {
        Object result = entityManager.createNativeQuery(
                "select coalesce(sum(amount), 0) from payments where invoice_id = ? and status = 'SUCCESS'")
            .setParameter(1, invoiceId)
            .getSingleResult();
        return result instanceof BigDecimal decimal ? decimal : new BigDecimal(String.valueOf(result));
    }

    private BigDecimal toMoney(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(String.valueOf(value));
    }

    private String customerName(Invoice invoice) {
        if (invoice.getWorkOrder() == null || invoice.getWorkOrder().getBooking() == null
                || invoice.getWorkOrder().getBooking().getCustomer() == null) {
            return "";
        }
        return invoice.getWorkOrder().getBooking().getCustomer().getFullName();
    }

    private String vehicleName(Invoice invoice) {
        if (invoice.getWorkOrder() == null || invoice.getWorkOrder().getBooking() == null
                || invoice.getWorkOrder().getBooking().getVehicle() == null) {
            return "";
        }
        var vehicle = invoice.getWorkOrder().getBooking().getVehicle();
        return String.join(" ",
            List.of(
                vehicle.getMake() == null ? "" : vehicle.getMake(),
                vehicle.getModel() == null ? "" : vehicle.getModel(),
                vehicle.getPlateNumber() == null ? "" : vehicle.getPlateNumber()
            )).trim();
    }
}

