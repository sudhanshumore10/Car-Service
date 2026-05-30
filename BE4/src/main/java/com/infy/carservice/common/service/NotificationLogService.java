package com.infy.carservice.common.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.common.entity.NotificationLog;
import com.infy.carservice.common.repository.NotificationLogRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class NotificationLogService {

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationTemplateService notificationTemplateService;

    public void notifyUser(Long userId, String status, String message) {
        if (userId == null) {
            return;
        }
        authRepository.findById(userId).ifPresent(user -> {
            NotificationLog log = new NotificationLog();
            log.setUser(user);
            log.setStatus(status);
            log.setMessage(notificationTemplateService.renderMessage(
                status,
                user,
                message,
                Map.of(
                    "status", status,
                    "message", message,
                    "name", user.getEmail(),
                    "email", user.getEmail()
                )
            ));
            notificationLogRepository.save(log);
        });
    }

    public Map<String, Object> resendNotification(Long notificationId, Long actorUserId) {
        NotificationLog original = notificationLogRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        NotificationLog resent = new NotificationLog();
        resent.setUser(original.getUser());
        resent.setStatus("RESENT");
        resent.setMessage(original.getMessage());
        NotificationLog saved = notificationLogRepository.save(resent);
        auditLogService.log(actorUserId, "NOTIFICATION_RESENT", "NOTIFICATION", saved.getId(), "SYSTEM");

        return toMap(saved);
    }

    @Transactional
    public List<Map<String, Object>> getNotifications(String status) {
        List<NotificationLog> logs = (status != null && !status.isBlank())
            ? notificationLogRepository.findTop200ByStatusContainingIgnoreCaseOrderByCreatedAtDesc(status)
            : notificationLogRepository.findTop200ByOrderByCreatedAtDesc();

        return logs.stream().map(this::toMap).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(NotificationLog log) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", log.getId());
        map.put("userId", log.getUser() != null ? log.getUser().getId() : null);
        map.put("userEmail", log.getUser() != null ? log.getUser().getEmail() : null);
        map.put("message", log.getMessage());
        map.put("status", log.getStatus());
        map.put("createdAt", log.getCreatedAt());
        return map;
    }
}
