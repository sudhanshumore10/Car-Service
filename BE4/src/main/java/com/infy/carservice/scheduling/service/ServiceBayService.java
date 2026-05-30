package com.infy.carservice.scheduling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.common.repository.TechnicianRepository;
import com.infy.carservice.scheduling.dto.AddBayDTO;
import com.infy.carservice.scheduling.dto.CreateServiceBayDTO;
import com.infy.carservice.scheduling.dto.CreateShiftDTO;
import com.infy.carservice.scheduling.entity.ServiceBays;
import com.infy.carservice.scheduling.entity.TechnicianShift;
import com.infy.carservice.scheduling.repository.ServiceBaysRepository;
import com.infy.carservice.scheduling.repository.TechnicianShiftRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;

import jakarta.transaction.Transactional;

@Service
public class ServiceBayService {
	
	@Autowired
	private ServiceBaysRepository bayRepo;
	@Autowired
	private WorkshopRepository workshopRepo;
	@Autowired
	private TechnicianRepository techRepo;
	@Autowired
	private TechnicianShiftRepository shiftRepo;
	@Transactional
	public void configure(CreateServiceBayDTO dto) {
		WorkShop workshop = workshopRepo.findById(dto.getWorkshopId()).orElseThrow(() -> new RuntimeException("Workshop not found."));
		
		if(dto.getBayNames() != null && !dto.getBayNames().isEmpty()) {
			for (String bayName : dto.getBayNames()) {
				ServiceBays bay = new ServiceBays();
				bay.setWorkshop(workshop);
				bay.setBayName(bayName);
				bayRepo.save(bay);
			}
		}
		if (dto.getShifts() != null) {
			for(CreateShiftDTO s:dto.getShifts()) {
				if(s.getShiftStart() == null || s.getShiftEnd() == null) {
					throw new RuntimeException("Shift time cannot be null.");
				}
				if(s.getShiftEnd().isBefore(s.getShiftStart())) {
					throw new RuntimeException("Invalid Shift Timing.");
				}
				Technician technician =  techRepo.findById(s.getTechnicianId()).orElseThrow(() -> new RuntimeException("Technician Not Found."));
				TechnicianShift shift = new TechnicianShift();
				shift.setTechnician(technician);
				shift.setShiftStart(s.getShiftStart());
				shift.setShiftEnd(s.getShiftEnd());
				shiftRepo.save(shift);
				
				
			}
		}
		
	}
	
	public void addBay(AddBayDTO dto) {
		WorkShop workshop = workshopRepo.findById(dto.getWorkshopId()).orElseThrow(()->new RuntimeException("Workshop not found."));
		ServiceBays bay = new ServiceBays();
		bay.setWorkshop(workshop);
		bay.setBayName(dto.getBayName());
		bayRepo.save(bay);
	}

}
