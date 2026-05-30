package com.infy.carservice.workshop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.workshop.dto.WorkshopRequestDTO;
import com.infy.carservice.workshop.dto.WorkshopResponseDTO;
import com.infy.carservice.workshop.dto.WorkshopUpdateDTO;
import com.infy.carservice.workshop.repository.WorkshopRepository;
import com.infy.carservice.workshop.service.WorkshopServiceImpl;

@RestController
@RequestMapping("/manager")
public class WorkshopController {

	@Autowired
	private WorkshopServiceImpl workshopService;

	@PostMapping("/workshop/addWorkshop")
	public ResponseEntity<WorkshopResponseDTO> createWorkshop(@RequestBody WorkshopRequestDTO dto) {
		WorkshopResponseDTO response = workshopService.createWorkshop(dto);
		return ResponseEntity.ok(response);

	}

	@PutMapping("/workshop/{id}")
	public ResponseEntity<WorkshopResponseDTO> update(@PathVariable Long id, @RequestBody WorkshopUpdateDTO dto) {
		WorkshopResponseDTO response = workshopService.updateWorkshop(id, dto);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/workshop")
	public ResponseEntity<List<WorkshopResponseDTO>> getAllWorkshops() {
		return ResponseEntity.ok(workshopService.getAllWorkshops());
	}

	@GetMapping("/workshop/manager/{id}")
	public ResponseEntity<List<WorkshopResponseDTO>> getAllWorkshopsByManager(@PathVariable Long id) {
		return ResponseEntity.ok(workshopService.getAllWorkshopsByManager(id));
	}

	@GetMapping("/workshop/{id}")
	public ResponseEntity<WorkshopResponseDTO> getById(@PathVariable Long id) {
		WorkshopResponseDTO response = workshopService.getWorkshopById(id);
		return ResponseEntity.ok(response);
	}

}
