package com.infy.carservice.common.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.infy.carservice.common.entity.Technician;

public interface TechnicianRepository extends CrudRepository<Technician,Long> {
	Technician findByUserId(Long userId);
	List<Technician> findByWorkshopId(Long workshopId);

}
