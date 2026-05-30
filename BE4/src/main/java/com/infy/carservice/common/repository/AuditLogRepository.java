package com.infy.carservice.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.common.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop200ByOrderByCreatedAtDesc();

    List<AuditLog> findTop200ByActionContainingIgnoreCaseOrderByCreatedAtDesc(String action);

    List<AuditLog> findTop200ByEntityContainingIgnoreCaseOrderByCreatedAtDesc(String entity);
}
