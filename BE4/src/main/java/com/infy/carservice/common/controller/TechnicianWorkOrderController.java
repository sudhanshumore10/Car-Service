package com.infy.carservice.common.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.dto.WorkOrderResponseDTO;
import com.infy.carservice.common.service.WorkOrderService;

@RestController
@RequestMapping("/technician/work-order")
public class TechnicianWorkOrderController {

    private final WorkOrderService workOrderService;

    public TechnicianWorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));
    }

    @GetMapping("/technician/{userId}")
    public ResponseEntity<List<WorkOrderResponseDTO>> getByTechnicianUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        List<WorkOrderResponseDTO> orders = workOrderService.getWorkOrdersByTechnicianUser(userId);
        if (status != null && !status.isBlank()) {
            orders = orders.stream()
                .filter(order -> status.equalsIgnoreCase(order.getStatus()))
                .toList();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/queue")
    public ResponseEntity<List<WorkOrderResponseDTO>> getQueue() {
        return ResponseEntity.ok(workOrderService.getOperationalQueue());
    }

    @PostMapping("/{id}/findings")
    public ResponseEntity<WorkOrderResponseDTO> saveFindings(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(workOrderService.saveFindings(id, payload));
    }

    @PostMapping("/{id}/estimate")
    public ResponseEntity<WorkOrderResponseDTO> saveEstimate(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(workOrderService.saveEstimate(id, payload));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<WorkOrderResponseDTO> convertApprovedEstimate(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.convertApprovedEstimate(id));
    }
}
