package com.infy.carservice.common.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import com.infy.carservice.common.entity.Manager;

public interface ManagerRepository extends CrudRepository<Manager,Long> {

	Manager findByUserId(Long userId);
	
}
