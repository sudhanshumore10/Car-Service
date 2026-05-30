package com.infy.carservice.scheduling.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.Address;
import com.infy.carservice.scheduling.dto.CreateWorkshopDTO;
import com.infy.carservice.scheduling.dto.UpdateWorkshopDTO;
import com.infy.carservice.scheduling.dto.WorkshopResponseDTO;
//import com.infy.carservice.scheduling.entity.Workshop;
import com.infy.carservice.scheduling.repository.AddressRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;
//import com.infy.carservice.scheduling.repository.WorkshopRepository;

@Service
public class WorkshopService {
	
	@Autowired
	private WorkshopRepository repo;
	@Autowired
	private AddressRepository addressRepo;
	
	public void createWorkshop(CreateWorkshopDTO dto) {
		Address address = new Address();
		address.setAddressLine1(dto.getAddress().getAddressLine1());
		address.setAddressLine2(dto.getAddress().getAddressLine2());
		address.setCity(dto.getAddress().getCity());
		address.setState(dto.getAddress().getState());
		address.setCountry(dto.getAddress().getCountry());
		address.setPincode(dto.getAddress().getPincode());
		
		addressRepo.save(address);
		
		WorkShop workshop = new WorkShop();          //error
		
		workshop.setName(dto.getName());
		workshop.setAddress(address);
//		workshop.setOpenTime(dto.getOpenTime());       //error
//		workshop.setCloseTime(dto.getCloseTime());        //error
		workshop.setStartTime(dto.getOpenTime().atDate(java.time.LocalDate.now()));
		workshop.setEndTime(dto.getCloseTime().atDate(java.time.LocalDate.now()));
		workshop.setServiceableBrands(dto.getServceableBrands());
		repo.save(workshop);
		}
	
	public void updateWorkshop(Long id, UpdateWorkshopDTO dto) {
		WorkShop w = repo.findById(id).orElseThrow();        //error
//		w.setOpenTime(dto.getOpenTime());
//		w.setCloseTime(dto.getCloseTime());
		w.setStartTime(dto.getOpenTime().atDate(java.time.LocalDate.now()));
		w.setEndTime(dto.getCloseTime().atDate(java.time.LocalDate.now()));
		
		w.setServiceableBrands(dto.getServiceableBrands());
	}
	
	public List<WorkshopResponseDTO> getAllWorkshops(){
		return repo.findAll().stream().map(w -> new WorkshopResponseDTO(
				w.getId(),
				w.getName(),
				w.getAddress().getAddressLine1(),
				w.getAddress().getAddressLine2(),
				w.getAddress().getCity(),
				w.getAddress().getState(),
				w.getAddress().getCountry(),
				w.getAddress().getPincode(),
				w.getStartTime() != null ? w.getStartTime().toLocalTime() : null,
				w.getEndTime() != null ? w.getEndTime().toLocalTime() : null,
						
				w.getServiceableBrands()
				)).toList();
	}
	
	public WorkshopResponseDTO getWorkshopById(Long id){
		WorkShop w =  repo.findById(id).orElseThrow(()-> new RuntimeException("Workshop does not exist"));
		WorkshopResponseDTO dto = new WorkshopResponseDTO();
		dto.setId(w.getId());
		dto.setName(w.getName());
		dto.setAddressLine1(w.getAddress().getAddressLine1());
		dto.setAddressLine2(w.getAddress().getAddressLine2());
		dto.setCity(w.getAddress().getCity());
		dto.setState(w.getAddress().getState());
		dto.setCountry(w.getAddress().getCountry());
		dto.setPincode(w.getAddress().getPincode());
		dto.setOpenTime(w.getStartTime() != null ?  w.getStartTime().toLocalTime() : null);
		dto.setCloseTime(w.getEndTime() != null ?  w.getEndTime().toLocalTime() : null);
		return dto;
		
		
		
	}
}
