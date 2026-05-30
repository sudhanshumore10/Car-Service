package com.infy.carservice.vehicle.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;
import com.infy.carservice.vehicle.dto.VehicleDocumentResponseDTO;
import com.infy.carservice.vehicle.dto.VehicleRequestDTO;
import com.infy.carservice.vehicle.dto.VehicleResponseDTO;
import com.infy.carservice.vehicle.entity.Vehicle;
import com.infy.carservice.vehicle.entity.VehicleDocument;
import com.infy.carservice.vehicle.repository.VehicleDocumentRepository;
import com.infy.carservice.vehicle.repository.VehicleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {
	
	@Autowired
	private  VehicleRepository vehicleRepository;
	
	@Autowired
	private  VehicleDocumentRepository vehicleDocumentRepository;
	
	@Autowired
	private CustomerRepository customerRepository;
	
	private ModelMapper modelMapper = new ModelMapper();
	
	
	
	public VehicleResponseDTO addVehicle(VehicleRequestDTO dto) {
	 
		
//		Customer customer = customerRepository.findById(dto.getCustomerId()).orElseThrow(()-> new RuntimeException("Customer Not Found"));
	
		Customer customer = customerRepository.findByUserId(dto.getUserId());
		
		if(customer== null) {
			throw new RuntimeException("Customer Not Found");
		}
		
		if(vehicleRepository.existsByVin(dto.getVin())) {
			throw new RuntimeException("VIN already exists.");
		}
		
	    Vehicle vehicle = new Vehicle();
	    vehicle.setMake(dto.getMake());
	    vehicle.setModel(dto.getModel());
	    vehicle.setVin(dto.getVin());
	    vehicle.setPlateNumber(dto.getPlateNumber());
	    vehicle.setYear(dto.getYear());
	    vehicle.setCustomer(customer);
	    
	    VehicleDocument document = new VehicleDocument();
	    document.setDocType(dto.getDocument().getDocType());
	    document.setFileUrl(dto.getDocument().getFileUrl());

	    vehicle.setVehicleDocument(document);
		
	    vehicle=vehicleRepository.save(vehicle);
	    
	    return modelMapper.map(vehicle, VehicleResponseDTO.class);
	
	}
	
	
	public List<VehicleResponseDTO> getVehicles(Long userId){
		
		Customer customer = customerRepository.findByUserId(userId);
		
		if(customer== null) {
			throw new RuntimeException("Customer Not Found");
		}
		
		List<VehicleResponseDTO> vehicleList = vehicleRepository.findByCustomerId(customer.getId())
																.stream()
																.map(v-> {
																	VehicleDocumentResponseDTO documentDTO = modelMapper.map(v.getVehicleDocument(),VehicleDocumentResponseDTO.class);
																	VehicleResponseDTO vehicleDTO = modelMapper.map(v,VehicleResponseDTO.class);
																	vehicleDTO.setVehicleDocument(documentDTO);
																	return vehicleDTO;
																}).toList();
		
		return vehicleList;
	}
//	
//	public void deactivateVehicle(Long vehicleId) {
//		Vehicle v = repo.findById(vehicleId).orElseThrow(()-> new InfyCarServiceException("Vehicle Not Found."));
//		v.setIsActive(false);
//		repo.save(v);
//	}
//	
//	public VehicleDocumentDTO uploadDocument(VehicleDocumentDTO dto) {
//		VehicleDocument doc = new VehicleDocument();
//		BeanUtils.copyProperties(dto, doc);
//		VehicleDocument saved = docRepo.save(doc);
//		dto.setId(saved.getId());
//		return dto;
//	}

}
