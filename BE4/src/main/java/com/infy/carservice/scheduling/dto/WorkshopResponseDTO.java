package com.infy.carservice.scheduling.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkshopResponseDTO {
	
	private Long id;
	private String name;
	private String addressLine1;
	private String addressLine2;
	private String city;
	private String state;
	private String country;
	private String pincode;
	
	
	private LocalTime openTime;
	private LocalTime closeTime;
	private String serviceableBrands;

}
