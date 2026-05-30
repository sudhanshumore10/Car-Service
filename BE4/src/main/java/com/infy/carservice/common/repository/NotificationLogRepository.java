package com.infy.carservice.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.common.entity.NotificationLog;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findTop200ByOrderByCreatedAtDesc();

    List<NotificationLog> findTop200ByStatusContainingIgnoreCaseOrderByCreatedAtDesc(String status);
}
