package com.infy.carservice.workshop.dto;

import java.time.LocalDateTime;

import com.infy.carservice.common.dto.AddressDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkshopResponseDTO {
	
	private Long id;
	private String name;

	
	private AddressDTO address;
	
	
	private LocalDateTime openTime;
	private LocalDateTime closeTime;
	
	private String serviceableBrands;
	
}
