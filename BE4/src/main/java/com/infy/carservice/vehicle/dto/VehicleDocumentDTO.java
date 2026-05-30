package com.infy.carservice.vehicle.dto;

import com.infy.carservice.vehicle.enums.DocumentType;

import lombok.Data;

@Data
public class VehicleDocumentDTO {
	
	private DocumentType docType;
	private String fileUrl;

}
