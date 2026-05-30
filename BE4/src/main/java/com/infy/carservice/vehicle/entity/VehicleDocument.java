package com.infy.carservice.vehicle.entity;

import com.infy.carservice.vehicle.enums.DocumentType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="vehicle_documents")
@Data
public class VehicleDocument {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long vehicleDocumentId;
	
	@Enumerated(EnumType.STRING)
	private DocumentType docType;
	
	private String fileUrl;

}


