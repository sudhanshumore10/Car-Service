package com.infy.carservice.scheduling.controller;

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

import com.infy.carservice.scheduling.dto.CreateWorkshopDTO;
import com.infy.carservice.scheduling.dto.UpdateWorkshopDTO;
import com.infy.carservice.scheduling.dto.WorkshopResponseDTO;

import com.infy.carservice.scheduling.service.WorkshopService;

//@RestController
//@RequestMapping("manager/workshops")
public class WorkshopController {

//	@Autowired
//    private  WorkshopRepository workshopRepository;
//	
//	@Autowired
//	private WorkshopService service;


	
//	@PostMapping
//	public ResponseEntity<String> createWorkshop(@RequestBody CreateWorkshopDTO dto){
//		service.createWorkshop(dto);
//		return ResponseEntity.ok("Workshop created.");
//		
//	}
//
//	@PutMapping("/{id}")
//	public void update(@PathVariable Long id, @RequestBody UpdateWorkshopDTO dto) {
//		service.updateWorkshop(id, dto);
//	}
//	
//	@GetMapping("/")
//	public List<WorkshopResponseDTO> getAllWorkshops(){
//		return service.getAllWorkshops();
//	}
//	
//	@GetMapping("/{id}")
//	public WorkshopResponseDTO getById(@PathVariable Long id) {
//		return service.getWorkshopById(id);
//	}
}
