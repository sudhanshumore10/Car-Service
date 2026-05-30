package com.infy.carservice.vehicle.controller;

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

import com.infy.carservice.vehicle.dto.VehicleDocumentDTO;
import com.infy.carservice.vehicle.dto.VehicleRequestDTO;
import com.infy.carservice.vehicle.dto.VehicleResponseDTO;
import com.infy.carservice.vehicle.service.VehicleServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vehicle")
public class VehicleController {
	
	@Autowired
	private VehicleServiceImpl vehicleService;
	
	@PostMapping("/addVehicle")
	public ResponseEntity<VehicleResponseDTO> add(@RequestBody VehicleRequestDTO dto){
		return ResponseEntity.ok(vehicleService.addVehicle(dto));
	}
	
	@GetMapping("/customer/{userId}")
	public ResponseEntity<List<VehicleResponseDTO>> getByCustomer(@PathVariable Long userId){
		return ResponseEntity.ok(vehicleService.getVehicles(userId));
	}
//	
//	@PutMapping("/{id}/deactivate")
//	public ResponseEntity<String>deactivate(@PathVariable Long id){
//		service.deactivateVehicle(id);
//		return ResponseEntity.ok("Vehicle deactivated.");
//	}
//	

}
