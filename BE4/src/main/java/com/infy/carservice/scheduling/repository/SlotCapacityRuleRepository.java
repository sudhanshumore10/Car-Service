package com.infy.carservice.scheduling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.scheduling.entity.SlotCapacityRule;

public interface SlotCapacityRuleRepository extends JpaRepository<SlotCapacityRule, Long> {
	
	List<SlotCapacityRule> findByWorkshopId(Long workshopId);
	

}
