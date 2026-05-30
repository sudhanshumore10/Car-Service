package com.infy.carservice.scheduling.controller;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.common.repository.TechnicianRepository;
import com.infy.carservice.scheduling.dto.TechnicianResponseDTO;

@RestController
@RequestMapping("manager/technicians")
public class TechnicianController {

    @Autowired
    private TechnicianRepository techRepo;

    @GetMapping
    public List<TechnicianResponseDTO> getAll() {
        return StreamSupport.stream(techRepo.findAll().spliterator(), false)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("workshop/{workshopId}")
    public List<TechnicianResponseDTO> getByWorkshop(@PathVariable Long workshopId) {
        return techRepo.findByWorkshopId(workshopId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TechnicianResponseDTO toDto(Technician technician) {
        Long workshopId = technician.getWorkshop() != null ? technician.getWorkshop().getId() : null;
        String workshopName = technician.getWorkshop() != null ? technician.getWorkshop().getName() : "Unassigned";
        return new TechnicianResponseDTO(
                technician.getTechnicianId(),
                technician.getTechnicianName(),
                technician.getSpecialization(),
                technician.getPhone(),
                workshopId,
                workshopName);
    }
}
