package com.infy.carservice.vehicle.dto;

import com.infy.carservice.vehicle.enums.DocumentType;

import lombok.Data;

@Data
public class VehicleDocumentResponseDTO {
	
	private Long vehicleDocumentId;
	private DocumentType docType;
	private String fileUrl;

}
