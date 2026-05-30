package com.infy.carservice.vehicle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.vehicle.entity.Vehicle;
import com.infy.carservice.vehicle.entity.VehicleDocument;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>{
	
	List<Vehicle> findByCustomerId (Long customerId);
	
	boolean existsByVin(String Vin);
	


}
