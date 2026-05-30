package com.infy.carservice.vehicle.dto;

import lombok.Data;

@Data
public class VehicleResponseDTO {
	 
	private Long vehicleId;
	
    private Long customerId;
	
	private String make;
	private String model;
	private Integer year;
	
	private String vin;
	private String plateNumber;
	
	private Boolean isActive;
	
	private VehicleDocumentResponseDTO vehicleDocument;
	
	
}
