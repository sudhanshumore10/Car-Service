package com.infy.carservice.scheduling.dto;

import java.time.LocalTime;

import com.infy.carservice.common.dto.AddressDTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateWorkshopDTO {
	private String name;
	
	private AddressDTO address;
	
	
	private LocalTime openTime;
	private LocalTime closeTime;
	
	private String servceableBrands;
}
