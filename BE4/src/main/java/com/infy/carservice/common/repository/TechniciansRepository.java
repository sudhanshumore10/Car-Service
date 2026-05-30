package com.infy.carservice.common.repository;

import org.springframework.data.repository.CrudRepository;

import com.infy.carservice.common.entity.Technicians;

public interface TechniciansRepository extends CrudRepository<Technicians,Long> {
	Technicians findByUserId(Long userId);
}
