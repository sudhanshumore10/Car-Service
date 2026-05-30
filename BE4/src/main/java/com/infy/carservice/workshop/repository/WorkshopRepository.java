package com.infy.carservice.workshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.workshop.entity.WorkShop;

public interface WorkshopRepository  extends JpaRepository<WorkShop,Long>{
	List<WorkShop> findByManagerId(Long id);
}
