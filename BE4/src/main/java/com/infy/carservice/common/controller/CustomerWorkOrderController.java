package com.infy.carservice.common.controller;

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
@RequestMapping("/customer/work-orders")
public class CustomerWorkOrderController {

    private final WorkOrderService workOrderService;

    public CustomerWorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponseDTO> getById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(workOrderService.getCustomerWorkOrderById(id, userId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<WorkOrderResponseDTO> recordApproval(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(workOrderService.recordCustomerApproval(id, userId, payload));
    }
}
