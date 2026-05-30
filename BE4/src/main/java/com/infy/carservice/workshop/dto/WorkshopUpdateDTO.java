package com.infy.carservice.workshop.dto;

import java.time.LocalDateTime;

import com.infy.carservice.common.dto.AddressDTO;

import lombok.Data;

@Data
public class WorkshopUpdateDTO {
	
	private String name;
	private LocalDateTime openTime;
	private LocalDateTime closeTime;
	private String serviceableBrands;
	private AddressDTO address;
	
}
