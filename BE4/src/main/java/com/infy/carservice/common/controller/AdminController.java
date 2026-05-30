package com.infy.carservice.common.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.service.AdminService;
import com.infy.carservice.common.service.AuditLogService;
import com.infy.carservice.common.service.NotificationLogService;
import com.infy.carservice.common.service.NotificationTemplateService;
import com.infy.carservice.common.service.SystemSettingService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationLogService notificationLogService;

    @Autowired
    private NotificationTemplateService notificationTemplateService;

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(adminService.getAdminSummary());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
        @RequestParam(required = false) String role,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(adminService.getUsers(role, status));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
        @PathVariable Long userId,
        @RequestParam String status,
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, status, actorUserId));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(
        @RequestParam(required = false) String action,
        @RequestParam(required = false) String entity
    ) {
        return ResponseEntity.ok(auditLogService.getLogs(action, entity));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(notificationLogService.getNotifications(status));
    }

    @PostMapping("/notifications/{notificationId}/resend")
    public ResponseEntity<?> resendNotification(
        @PathVariable Long notificationId,
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(notificationLogService.resendNotification(notificationId, actorUserId));
    }

    @GetMapping("/notification-templates")
    public ResponseEntity<?> getNotificationTemplates() {
        return ResponseEntity.ok(notificationTemplateService.getTemplates());
    }

    @PostMapping("/notification-templates/reset-defaults")
    public ResponseEntity<?> resetNotificationTemplates(
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(notificationTemplateService.restoreDefaultTemplates(actorUserId));
    }

    @PutMapping("/notification-templates/{templateKey}")
    public ResponseEntity<?> updateNotificationTemplate(
        @PathVariable String templateKey,
        @RequestBody java.util.Map<String, Object> payload,
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(notificationTemplateService.updateTemplate(templateKey, payload, actorUserId));
    }

    @PostMapping("/notification-templates/{templateKey}/test-send")
    public ResponseEntity<?> testSendTemplate(
        @PathVariable String templateKey,
        @RequestParam Long userId,
        @RequestParam(required = false) Long actorUserId
    ) {
        String message = notificationTemplateService.previewTemplate(templateKey, userId);
        notificationLogService.notifyUser(userId, templateKey, message);
        auditLogService.log(actorUserId, "NOTIFICATION_TEMPLATE_TEST_SENT", "NOTIFICATION_TEMPLATE", null, "ADMIN");
        return ResponseEntity.ok(java.util.Map.of(
            "templateKey", templateKey,
            "userId", userId,
            "message", message
        ));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        return ResponseEntity.ok(systemSettingService.getSettings());
    }

    @GetMapping("/settings/export")
    public ResponseEntity<?> exportSettings() {
        return ResponseEntity.ok(systemSettingService.exportSettingsSnapshot());
    }

    @PostMapping("/settings/import")
    public ResponseEntity<?> importSettings(
        @RequestBody java.util.Map<String, Object> payload,
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(systemSettingService.importSettingsSnapshot(payload, actorUserId));
    }

    @PutMapping("/settings/{settingKey}")
    public ResponseEntity<?> updateSetting(
        @PathVariable String settingKey,
        @RequestBody java.util.Map<String, Object> payload,
        @RequestParam(required = false) Long actorUserId
    ) {
        return ResponseEntity.ok(systemSettingService.updateSetting(settingKey, payload, actorUserId));
    }

    @GetMapping("/system-info")
    public ResponseEntity<?> getSystemInfo() {
        return ResponseEntity.ok(systemSettingService.getSystemInfo());
    }
}
