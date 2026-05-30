package com.infy.carservice.customer.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.common.entity.Address;
import com.infy.carservice.customer.dto.CustomerResponseDTO;
import com.infy.carservice.customer.dto.CustomerUpdateDTO;
import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;
import com.infy.carservice.exception.InfyCarServiceException;

import lombok.RequiredArgsConstructor;

@Service(value="customerService")
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
	
	@Autowired
	private  CustomerRepository customerRepository;
	
	@Autowired
	private AuthRepository userRepository;
	
	private ModelMapper modelMapper = new ModelMapper();
	
	public CustomerResponseDTO updateProfile(Long userId,CustomerUpdateDTO dto) {
		System.out.println("Kunal");
		Customer customer = customerRepository.findByUserId(userId);
		if(dto.getFullName()!=null) {
			customer.setFullName(dto.getFullName());
		}
		if(dto.getAddress()!=null) {
			Address address = modelMapper.map(dto.getAddress(), Address.class);
			customer.setAddress(address);
		}
		
		User user = customer.getUser();
		
		if(dto.getPhone()!= null) {
			user.setPhone(dto.getPhone());
			userRepository.save(user);
		}
		
		Customer updated = customerRepository.save(customer);
		
		return mapToDTO(customer);
		
	}
	
	public CustomerResponseDTO getByUserId(Long userId) {
		Customer customer = customerRepository.findByUserId(userId);
		CustomerResponseDTO dto =modelMapper.map(customer,CustomerResponseDTO.class );
		
		dto.setEmail(customer.getUser().getEmail());
		dto.setPhone(customer.getUser().getPhone());
		
		return dto;
	}

	
	private CustomerResponseDTO  mapToDTO(Customer customer) {
		CustomerResponseDTO dto = modelMapper.map(customer,CustomerResponseDTO.class);
	
		dto.setUserId(customer.getUser().getId());
		dto.setEmail(customer.getUser().getEmail());
		dto.setPhone(customer.getUser().getPhone());
		
		return dto;
	}
}
