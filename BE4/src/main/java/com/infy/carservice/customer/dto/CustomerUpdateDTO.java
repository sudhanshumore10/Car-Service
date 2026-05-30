package com.infy.carservice.customer.dto;

import com.infy.carservice.common.dto.AddressDTO;

import lombok.Data;

@Data
public class CustomerUpdateDTO {
	
	private String fullName;
	
	private String phone;
	
	private AddressDTO address;
}
