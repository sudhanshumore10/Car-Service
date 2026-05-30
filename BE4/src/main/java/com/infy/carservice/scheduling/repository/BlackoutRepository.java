package com.infy.carservice.scheduling.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.scheduling.entity.BlackoutDate;
import java.util.List;
import com.infy.carservice.workshop.entity.WorkShop;


public interface BlackoutRepository extends JpaRepository<BlackoutDate, Long> {
	boolean existsByWorkshopIdAndDate(Long workshopId, LocalDate date);
	List<BlackoutDate> findByWorkshopId(Long workshopId);

}
