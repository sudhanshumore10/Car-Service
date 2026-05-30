
package com.infy.carservice.scheduling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.common.entity.Technicians;
import com.infy.carservice.scheduling.entity.Technician;

public interface SchedulingTechnicianRepository extends JpaRepository<Technician, Long>{
	List<Technicians> findByWorkshopId(Long workshopId);

}
