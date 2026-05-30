package com.infy.carservice.common.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.infy.carservice.common.entity.WorkOrder;

@Repository

public interface WorkOrderRepository 

        extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByBookingId(Long bookingId);

    List<WorkOrder> findByBookingWorkshopId(Long workshopId);

    List<WorkOrder> findByBookingWorkshopIdAndStatus(

            Long workshopId, String status);

}