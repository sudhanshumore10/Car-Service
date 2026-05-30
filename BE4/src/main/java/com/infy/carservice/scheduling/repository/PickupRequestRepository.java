package com.infy.carservice.scheduling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.scheduling.entity.PickupRequest;

public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
	List<PickupRequest> findByBookingId(Long bookingId);
}
