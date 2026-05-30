package com.infy.carservice.scheduling.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.CreateShiftDTO;
import com.infy.carservice.scheduling.dto.ShiftResponseDTO;
import com.infy.carservice.scheduling.repository.TechnicianShiftRepository;
import com.infy.carservice.scheduling.service.TechnicianShiftService;

@RestController
@RequestMapping("manager/shifts-legacy")
public class TechnicialShiftController {
	
	@Autowired
	private TechnicianShiftService service;
	
	@Autowired
	private TechnicianShiftRepository repo;
	
	@PostMapping
	public void addShift(@RequestBody CreateShiftDTO dto) {
		service.addShift(dto);
	}
	
	@GetMapping("/workshop/{workshopId}")
	public List<ShiftResponseDTO> getByWorkshop(@PathVariable  Long WorkshopId){				
				return repo.findByWorkshopId(WorkshopId)

				        .stream()

				        .map(s -> new ShiftResponseDTO(

				                s.getId(),

				                s.getTechnician() != null && s.getTechnician().getWorkshop() != null

				                        ? s.getTechnician().getWorkshop().getId()

				                        : null,

				                s.getTechnician() != null

				                        ? s.getTechnician().getTechnicianId()

				                        : null,

				                s.getTechnician() != null

				                        ? s.getTechnician().getTechnicianName()

				                        : null,				                

				                null,

				                s.getShiftStart() != null

				                        ? s.getShiftStart()

				                        : null,

				                s.getShiftEnd() != null

				                        ? s.getShiftEnd()

				                        : null,

				                null

				        ))

				        .collect(Collectors.toList());
	}
}
