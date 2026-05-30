package com.infy.carservice.scheduling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.scheduling.dto.CreateBlackoutDTO;
import com.infy.carservice.scheduling.entity.BlackoutDate;
import com.infy.carservice.scheduling.repository.BlackoutRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;


@Service
public class BlackoutService {
	@Autowired
	private BlackoutRepository repo;
	@Autowired
	private WorkshopRepository workshopRepo;
	
	public void addBlackOut(CreateBlackoutDTO dto) {
//		System.out.println("kunsl;");
		BlackoutDate b = new BlackoutDate();
		WorkShop workshop= workshopRepo.findById(dto.getWorkshopId()).orElseThrow(()-> new RuntimeException("Workshop don't exist."));
//		b.setWorkshop(WorkShop);
//		b.setDate(dto.getDate());
//		b.setReason(dto.getReason());
		b.setWorkshop(workshop);
		b.setDate(dto.getDate());
		b.setReason(dto.getReason());
//		System.out.println("kkkkk");
		repo.save(b);
	}

}
