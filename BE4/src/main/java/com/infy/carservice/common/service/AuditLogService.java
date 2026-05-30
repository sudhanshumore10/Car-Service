package com.infy.carservice.common.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.common.entity.AuditLog;
import com.infy.carservice.common.repository.AuditLogRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuthRepository authRepository;

    public void log(Long userId, String action, String entity, Long entityId, String ipAddress) {
        AuditLog log = new AuditLog();
        if (userId != null) {
            authRepository.findById(userId).ifPresent(log::setUser);
        }
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setIpAddress(ipAddress != null ? ipAddress : "SYSTEM");
        auditLogRepository.save(log);
    }

    @Transactional
    public List<Map<String, Object>> getLogs(String action, String entity) {
        List<AuditLog> logs = auditLogRepository.findTop200ByOrderByCreatedAtDesc()
            .stream()
            .filter(log -> action == null || action.isBlank()
                || (log.getAction() != null && log.getAction().toLowerCase().contains(action.toLowerCase())))
            .filter(log -> entity == null || entity.isBlank()
                || (log.getEntity() != null && log.getEntity().toLowerCase().contains(entity.toLowerCase())))
            .collect(Collectors.toList());

        return logs.stream().map(this::toMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(AuditLog log) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", log.getId());
        map.put("userId", log.getUser() != null ? log.getUser().getId() : null);
        map.put("userEmail", log.getUser() != null ? log.getUser().getEmail() : null);
        map.put("action", log.getAction());
        map.put("entity", log.getEntity());
        map.put("entityId", log.getEntityId());
        map.put("ipAddress", log.getIpAddress());
        map.put("createdAt", log.getCreatedAt());
        return map;
    }
}
