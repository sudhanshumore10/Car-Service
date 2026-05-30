package com.infy.carservice.scheduling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.common.repository.TechnicianRepository;
//import com.infy.carservice.scheduling.entity.Technician;
import com.infy.carservice.scheduling.dto.CreateShiftDTO;
import com.infy.carservice.scheduling.entity.TechnicianShift;
import com.infy.carservice.scheduling.repository.TechnicianShiftRepository;

@Service
public class TechnicianShiftService {
	
	@Autowired
	private TechnicianShiftRepository repo;
	
	@Autowired
	private TechnicianRepository techRepo;
	
	public void addShift(CreateShiftDTO dto) {
		if(dto.getShiftEnd().isBefore(dto.getShiftStart())) {
			throw new RuntimeException("Invalid shift");
		}
		TechnicianShift shift = new TechnicianShift();
		
		Technician technician = techRepo.findById(dto.getTechnicianId()).orElseThrow(()->
		new RuntimeException("Technician not found."));
		
	
		
//		shift.setTechnician(techRepo.findById(dto.getTechnicianId()).orElseThrow());
		shift.setTechnician(technician);
		shift.setShiftStart(dto.getShiftStart());
		shift.setShiftEnd(dto.getShiftEnd());
		
		
		repo.save(shift);
	}
}
