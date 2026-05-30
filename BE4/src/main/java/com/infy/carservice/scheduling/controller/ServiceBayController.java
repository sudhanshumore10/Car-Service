package com.infy.carservice.scheduling.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.AddBayDTO;
import com.infy.carservice.scheduling.dto.ServiceBayResponseDTO;
import com.infy.carservice.scheduling.entity.ServiceBays;
import com.infy.carservice.scheduling.repository.ServiceBaysRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;

@RestController
@RequestMapping("manager/bays")
public class ServiceBayController {
	
	@Autowired
	private ServiceBaysRepository bayRepo;
	
	@Autowired
	private WorkshopRepository workshopRepo;

	
	@GetMapping("/{workshopId}")
	public List<ServiceBayResponseDTO> getWorkshop(@PathVariable Long workshopId){
		return bayRepo.findByWorkshopId(workshopId).stream().map(b-> new ServiceBayResponseDTO(b.getId(),
				b.getWorkshop().getId(),b.getBayName())).collect(Collectors.toList());
	}
	
	@PostMapping
	public ServiceBayResponseDTO add(@RequestBody AddBayDTO dto) {
		WorkShop workshop = workshopRepo.findById(dto.getWorkshopId()).orElseThrow(()-> new RuntimeException("Workshop Not Found"));
		ServiceBays bay = new ServiceBays();
		bay.setWorkshop(workshop);
		bay.setBayName(dto.getBayName());
		ServiceBays saved = bayRepo.save(bay);
		return new ServiceBayResponseDTO(saved.getId(),workshop.getId(),saved.getBayName());
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		bayRepo.deleteById(id);
	}
}