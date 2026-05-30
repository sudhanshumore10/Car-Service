package com.infy.carservice.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.infy.carservice.common.entity.WorkOrderLog;

@Repository

public interface WorkOrderLogRepository 

        extends JpaRepository<WorkOrderLog, Long> {

    List<WorkOrderLog> findByWorkOrderIdOrderByTimestampAsc(

            Long workOrderId);

}

















