package com.infy.carservice.customer.service;

import com.infy.carservice.customer.dto.CustomerResponseDTO;
import com.infy.carservice.customer.dto.CustomerUpdateDTO;

public interface CustomerService {
	
	CustomerResponseDTO updateProfile(Long userId,CustomerUpdateDTO dto);
	
	CustomerResponseDTO getByUserId(Long userId);
	
}
