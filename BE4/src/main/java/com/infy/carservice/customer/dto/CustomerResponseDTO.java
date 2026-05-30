package com.infy.carservice.customer.dto;

import java.util.List;

import com.infy.carservice.common.dto.AddressDTO;


import lombok.Data;

@Data
public class CustomerResponseDTO {

	private Long userId;
	private String fullName;
	private String email;
	private String phone;
	private AddressDTO address;

}
