package com.infy.carservice.workshop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.workshop.dto.WorkshopResponseDTO;
import com.infy.carservice.workshop.service.WorkshopServiceImpl;

@RestController
@RequestMapping("/customer/workshops")
public class CustomerWorkshopController {

    @Autowired
    private WorkshopServiceImpl workshopService;

    @GetMapping
    public ResponseEntity<List<WorkshopResponseDTO>> getAllWorkshops() {
        return ResponseEntity.ok(workshopService.getAllWorkshops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkshopResponseDTO> getWorkshopById(@PathVariable Long id) {
        return ResponseEntity.ok(workshopService.getWorkshopById(id));
    }
}
