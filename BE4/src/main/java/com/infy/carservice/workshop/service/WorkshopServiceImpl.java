package com.infy.carservice.workshop.service;

import java.util.List;
import org.modelmapper.ModelMapper; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.stereotype.Service; 
import com.infy.carservice.common.dto.AddressDTO; 
import com.infy.carservice.common.entity.Address;
import com.infy.carservice.common.entity.Manager; 
import com.infy.carservice.common.repository.ManagerRepository;
import com.infy.carservice.scheduling.repository.AddressRepository; 
import com.infy.carservice.workshop.dto.WorkshopRequestDTO; 
import com.infy.carservice.workshop.dto.WorkshopResponseDTO; 
import com.infy.carservice.workshop.dto.WorkshopUpdateDTO;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;
import jakarta.transaction.Transactional;

@Service 
@Transactional
public class WorkshopServiceImpl implements WorkshopService { 
	@Autowired 
	private ManagerRepository managerRepository; 
	@Autowired 
	private AddressRepository addressRepository; 
	@Autowired 
	private WorkshopRepository workshopRepository; 
	private ModelMapper modelMapper = new ModelMapper(); 
	private WorkshopResponseDTO toDTO(WorkShop w) { 
		WorkshopResponseDTO dto = new WorkshopResponseDTO(); 
		dto.setId(w.getId()); 
		dto.setName(w.getName()); 
		dto.setOpenTime(w.getStartTime()); 
		dto.setCloseTime(w.getEndTime());
		dto.setServiceableBrands(w.getServiceableBrands()); 
		if (w.getAddress() != null) {
			dto.setAddress(modelMapper.map(w.getAddress(), AddressDTO.class)); 
			}
		return dto; } 
	public WorkshopResponseDTO createWorkshop(WorkshopRequestDTO dto) { 
		Manager manager = managerRepository.findByUserId(dto.getUserId()); 
		if (manager.getId() == null) throw new RuntimeException("Manager does not exist");
		Address address = new Address(); 
		address.setAddressLine1(dto.getAddress().getAddressLine1()); 
		address.setAddressLine2(dto.getAddress().getAddressLine2()); 
		address.setCity(dto.getAddress().getCity()); 
		address.setState(dto.getAddress().getState());
		address.setCountry(dto.getAddress().getCountry()); 
		address.setPincode(dto.getAddress().getPincode());
		addressRepository.save(address); 
		WorkShop workshop = new WorkShop(); 
		workshop.setManager(manager); 
		workshop.setName(dto.getName()); 
		workshop.setStartTime(dto.getOpenTime());
		workshop.setEndTime(dto.getCloseTime()); 
		workshop.setAddress(address); 
		workshop.setServiceableBrands(dto.getServiceableBrands()); 
		return toDTO(workshopRepository.save(workshop));
		} 
	public WorkshopResponseDTO updateWorkshop(Long id, WorkshopUpdateDTO dto) { 
		WorkShop workshop = workshopRepository.findById(id) .orElseThrow(() -> new RuntimeException("Workshop does not exist")); 
		if (dto.getName() != null && !dto.getName().isBlank()) { 
			workshop.setName(dto.getName()); 
			} if (dto.getOpenTime() != null) workshop.setStartTime(dto.getOpenTime());
			if (dto.getCloseTime() != null) workshop.setEndTime(dto.getCloseTime());
			if (dto.getServiceableBrands() != null) workshop.setServiceableBrands(dto.getServiceableBrands());
			// Update address fields in place (address is already persisted) 
			if (dto.getAddress() != null && workshop.getAddress() != null) { 
				Address addr = workshop.getAddress(); 
				if (dto.getAddress().getAddressLine1() != null) addr.setAddressLine1(dto.getAddress().getAddressLine1()); 
				if (dto.getAddress().getAddressLine2() != null) addr.setAddressLine2(dto.getAddress().getAddressLine2()); 
				if (dto.getAddress().getCity() != null) addr.setCity(dto.getAddress().getCity()); 
				if (dto.getAddress().getState() != null) addr.setState(dto.getAddress().getState()); 
				if (dto.getAddress().getCountry() != null) addr.setCountry(dto.getAddress().getCountry()); 
				if (dto.getAddress().getPincode() != null) addr.setPincode(dto.getAddress().getPincode()); 
				} return toDTO(workshopRepository.save(workshop));
				}
	public List<WorkshopResponseDTO> getAllWorkshops() {
		List<WorkShop> list = workshopRepository.findAll(); 
		if (list.isEmpty()) throw new RuntimeException("Workshop list is empty"); 
		return list.stream().map(this::toDTO).toList();
		} 
	
	public WorkshopResponseDTO getWorkshopById(Long id) { 
		return toDTO(workshopRepository.findById(id) .orElseThrow(() -> new RuntimeException("Workshop does not exist")));
		}
	
	public List<WorkshopResponseDTO> getAllWorkshopsByManager(Long userId) { 
		Manager manager = managerRepository.findByUserId(userId);
		if (manager.getId() == null) throw new RuntimeException("Manager does not exist"); 
		List<WorkShop> list = workshopRepository.findByManagerId(manager.getId()); 
		if (list.isEmpty()) throw new RuntimeException("No workshops found for this manager"); 
		return list.stream().map(this::toDTO).toList(); 
		} 
		
}
		

