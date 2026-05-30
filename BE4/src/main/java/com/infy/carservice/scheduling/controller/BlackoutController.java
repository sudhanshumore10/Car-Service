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

import com.infy.carservice.scheduling.dto.BlackoutResponseDTO;
import com.infy.carservice.scheduling.dto.CreateBlackoutDTO;
import com.infy.carservice.scheduling.repository.BlackoutRepository;
import com.infy.carservice.scheduling.service.BlackoutService;

@RestController
@RequestMapping("manager/blackouts")
public class BlackoutController {
	
	@Autowired
	private BlackoutService service;
	
	@Autowired
	private BlackoutRepository repo;
	
	@PostMapping
	public void add(@RequestBody CreateBlackoutDTO dto) {
		service.addBlackOut(dto);
	}
	@GetMapping("/{workshopId}")
	public List<BlackoutResponseDTO> getByWorkshop(@PathVariable Long workshopId){
		return repo.findByWorkshopId(workshopId).stream()
				.map(b-> new BlackoutResponseDTO(b.getId(), 
				b.getWorkshop().getId(),b.getDate().toString(),b.getReason())).collect(Collectors.toList());
		
	}
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		repo.deleteById(id);
	}
	

}
