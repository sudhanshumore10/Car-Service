package com.infy.carservice.vehicle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.vehicle.entity.VehicleDocument;

public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, Long>{
	
	

}
