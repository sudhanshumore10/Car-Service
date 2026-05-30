package com.infy.carservice.parts.service;

import com.infy.carservice.common.entity.WorkOrder;
import com.infy.carservice.common.repository.WorkOrderRepository;
import com.infy.carservice.parts.dto.AddPartToWorkOrderDTO;
import com.infy.carservice.parts.dto.PartResponseDTO;
import com.infy.carservice.parts.dto.WorkOrderPartResponseDTO;
import com.infy.carservice.parts.entity.*;
import com.infy.carservice.parts.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartServiceImpl implements PartService {

    @Autowired
    private PartRepository partRepo;

    @Autowired
    private WorkOrderPartRepository wopRepo;

    @Autowired
    private WorkOrderRepository workOrderRepo;

    @Autowired
    private InvoiceRepository invoiceRepo;

    @Autowired
    private InvoiceItemRepository invoiceItemRepo;


    private PartResponseDTO toPartDTO(Part p) {
        return new PartResponseDTO(p.getId(), p.getName(), p.getSku(), p.getPrice(), p.getStock());
    }

    private WorkOrderPartResponseDTO toWopDTO(WorkOrderPart wop) {
        Part p = wop.getPart();
        BigDecimal lineTotal = p.getPrice().multiply(BigDecimal.valueOf(wop.getQuantity()));
        return new WorkOrderPartResponseDTO(
            wop.getId(),
            wop.getWorkOrder().getId(),
            p.getId(),
            p.getName(),
            p.getSku(),
            p.getPrice(),
            wop.getQuantity(),
            lineTotal,
            wop.getIsBackorder(),
            p.getStock()
        );
    }


    @Override
    public List<PartResponseDTO> getAllParts() {
        return partRepo.findAll().stream().map(this::toPartDTO).collect(Collectors.toList());
    }

    @Override
    public List<PartResponseDTO> searchParts(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllParts();
        return partRepo.searchByNameOrSku(keyword).stream().map(this::toPartDTO).collect(Collectors.toList());
    }

    @Override
    public WorkOrderPartResponseDTO addPartToWorkOrder(Long workOrderId, AddPartToWorkOrderDTO dto) {
        WorkOrder workOrder = workOrderRepo.findById(workOrderId)
            .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        Part part = partRepo.findById(dto.getPartId())
            .orElseThrow(() -> new RuntimeException("Part not found: " + dto.getPartId()));

        int requestedQty = dto.getQuantity();
        int availableStock = part.getStock() != null ? part.getStock() : 0;

        boolean isBackorder = requestedQty > availableStock;

        int actualDecrement = Math.min(requestedQty, availableStock);
        part.setStock(availableStock - actualDecrement);
        partRepo.save(part);

        // Persist work order part
        WorkOrderPart wop = new WorkOrderPart();
        wop.setWorkOrder(workOrder);
        wop.setPart(part);
        wop.setQuantity(requestedQty);
        wop.setIsBackorder(isBackorder);
        wop = wopRepo.save(wop);

        // Sync invoice item
        syncInvoiceItem(workOrder, part, requestedQty);

        return toWopDTO(wop);
    }

    @Override
    public List<WorkOrderPartResponseDTO> getPartsByWorkOrder(Long workOrderId) {
        return wopRepo.findByWorkOrderId(workOrderId).stream()
            .map(this::toWopDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void removePartFromWorkOrder(Long workOrderPartId) {
        WorkOrderPart wop = wopRepo.findById(workOrderPartId)
            .orElseThrow(() -> new RuntimeException("WorkOrderPart not found: " + workOrderPartId));

        // Restore stock on removal
        Part part = wop.getPart();
        int restore = wop.getIsBackorder()
            ? Math.min(wop.getQuantity(), 0) 
            : wop.getQuantity();
        part.setStock(part.getStock() + restore);
        partRepo.save(part);

        wopRepo.deleteById(workOrderPartId);
    }


    private void syncInvoiceItem(WorkOrder workOrder, Part part, int qty) {
        // Find or create invoice for this work order
        Invoice invoice = invoiceRepo.findByWorkOrderId(workOrder.getId())
            .orElseGet(() -> {
                Invoice newInvoice = new Invoice();
                newInvoice.setWorkOrder(workOrder);
                newInvoice.setTotalAmount(BigDecimal.ZERO);
                newInvoice.setStatus("PENDING");
                newInvoice.setCreatedAt(LocalDateTime.now());
                return invoiceRepo.save(newInvoice);
            });

        BigDecimal lineTotal = part.getPrice().multiply(BigDecimal.valueOf(qty));

        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setDescription(part.getName() + " x" + qty + " (SKU: " + part.getSku() + ")");
        item.setAmount(lineTotal);
        invoiceItemRepo.save(item);

        List<InvoiceItem> allItems = invoiceItemRepo.findByInvoiceId(invoice.getId());
        BigDecimal total = allItems.stream()
            .map(InvoiceItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setTotalAmount(total);
        invoiceRepo.save(invoice);
    }
}
