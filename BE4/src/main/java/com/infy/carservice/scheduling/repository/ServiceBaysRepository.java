package com.infy.carservice.scheduling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.scheduling.entity.CarService;
import com.infy.carservice.scheduling.entity.ServiceBays;
import java.util.List;


public interface ServiceBaysRepository extends JpaRepository<ServiceBays, Long>{

	int countByWorkshopId(Long workshopId);
	List<ServiceBays> findByWorkshopId(Long workshopId
			);

}
