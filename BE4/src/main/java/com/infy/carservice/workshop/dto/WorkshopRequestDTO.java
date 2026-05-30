package com.infy.carservice.workshop.dto;

import java.time.LocalDateTime;

import com.infy.carservice.common.dto.AddressDTO;

import lombok.Data;

@Data
public class WorkshopRequestDTO {
	private String name;
	private Long userId;
	
	private AddressDTO address;
	
	
	private LocalDateTime openTime;
	private LocalDateTime closeTime;
	
	private String serviceableBrands;
}
