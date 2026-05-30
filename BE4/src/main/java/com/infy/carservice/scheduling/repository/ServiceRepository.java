package com.infy.carservice.scheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.scheduling.entity.CarService;

public interface ServiceRepository extends JpaRepository<CarService, Long> {
	
	

}
