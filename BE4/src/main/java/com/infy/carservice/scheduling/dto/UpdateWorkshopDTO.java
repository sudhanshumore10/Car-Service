package com.infy.carservice.scheduling.dto;

import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkshopDTO {
	private LocalTime openTime;
	private LocalTime closeTime;
	private String serviceableBrands;

}
