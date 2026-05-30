package com.infy.carservice.vehicle.dto;


import lombok.Data;
import lombok.Getter;

@Data
public class VehicleRequestDTO {
	
	private Long userId;
	
	private String make;
	private String model;
	private Integer year;
	
	private String vin;
	private String plateNumber;
	
	private Boolean isActive;
//	private Boolean isDefault;
	
	
	private VehicleDocumentDTO document;
}

