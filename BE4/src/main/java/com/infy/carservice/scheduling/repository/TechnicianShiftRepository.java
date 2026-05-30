package com.infy.carservice.scheduling.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.infy.carservice.scheduling.entity.TechnicianShift;

public interface TechnicianShiftRepository extends JpaRepository<TechnicianShift, Long> {

	@Query("""
			SELECT COUNT(ts)
			FROM TechnicianShift ts
			JOIN ts.technician t
			WHERE t.workshop.id = :workshopId
			AND :time >= ts.shiftStart
			AND :time < ts.shiftEnd
			""")
	int countActiveTechnicians(@Param("workshopId") Long workshopId, @Param("time") LocalTime time);

	@Query("SELECT ts FROM TechnicianShift ts JOIN ts.technician t WHERE t.workshop.id = :workshopId")
	List<TechnicianShift> findByWorkshopId(@Param("workshopId") Long workshopId);
}

