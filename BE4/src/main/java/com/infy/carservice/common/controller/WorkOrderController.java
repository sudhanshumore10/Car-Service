package com.infy.carservice.common.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.dto.AssignTechnicianDTO;
import com.infy.carservice.common.dto.UpdateWorkOrderStatusDTO;
import com.infy.carservice.common.dto.WorkOrderResponseDTO;
import com.infy.carservice.common.service.WorkOrderService;
//import com.infy.carservice.workorder.entity.WorkOrderStatus;


import jakarta.validation.Valid;

@RestController

@RequestMapping("/manager/work-orders")

public class WorkOrderController {

    @Autowired

    private WorkOrderService workOrderService;

    @GetMapping("/{id}")

    public ResponseEntity<WorkOrderResponseDTO> getById(

            @PathVariable Long id) {

        return ResponseEntity.ok(workOrderService.getWorkOrderById(id));

    }

    @GetMapping("/workshop/{workshopId}")

    public ResponseEntity<List<WorkOrderResponseDTO>> getByWorkshop(

            @PathVariable Long workshopId,

            @RequestParam(required = false) String status) {

        if (status != null) {

            return ResponseEntity.ok(

                workOrderService.getWorkOrdersByStatus(workshopId, status));

        }

        return ResponseEntity.ok(

            workOrderService.getWorkOrdersByWorkshop(workshopId));

    }

    @PutMapping("/{id}/status")

    public ResponseEntity<WorkOrderResponseDTO> updateStatus(

            @PathVariable Long id,

            @Valid @RequestBody UpdateWorkOrderStatusDTO dto) {

        return ResponseEntity.ok(workOrderService.updateStatus(id, dto));

    }

    @PutMapping("/{id}/assign-technician")

    public ResponseEntity<WorkOrderResponseDTO> assignTechnician(

            @PathVariable Long id,

            @Valid @RequestBody AssignTechnicianDTO dto) {

        return ResponseEntity.ok(workOrderService.assignTechnician(id, dto));

    }

}