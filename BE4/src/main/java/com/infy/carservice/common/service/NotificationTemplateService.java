package com.infy.carservice.common.service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.common.entity.NotificationTemplate;
import com.infy.carservice.common.repository.NotificationTemplateRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class NotificationTemplateService {

    private static final List<Map<String, Object>> DEFAULT_TEMPLATES = List.of(
        template("ACCOUNT_CREATED", "Account Created", "Welcome to CarService, {{name}}. Your account is now active."),
        template("ACCOUNT_STATUS", "Account Status Updated", "Your CarService account status is now {{message}}"),
        template("BOOKING_CONFIRMED", "Booking Confirmed", "Booking {{bookingId}} confirmed for {{slotTime}}. {{message}}"),
        template("BOOKING_CANCELLED", "Booking Cancelled", "Your booking {{bookingId}} was cancelled. {{message}}"),
        template("BOOKING_RESCHEDULED", "Booking Rescheduled", "Your booking {{bookingId}} was rescheduled to {{slotTime}}. {{message}}"),
        template("WORK_ORDER_STATUS", "Work Order Status", "Work order update: {{message}}"),
        template("PICKUP_STATUS_UPDATED", "Pickup Status Updated", "Pickup/drop status changed: {{message}}"),
        template("PICKUP_REQUEST_CANCELLED", "Pickup Request Cancelled", "Your pickup/drop request was cancelled."),
        template("ESTIMATE_READY", "Estimate Ready", "Your estimate is ready for approval. {{message}}"),
        template("ESTIMATE_APPROVED", "Estimate Approved", "Your estimate was approved and the invoice is now ready."),
        template("ESTIMATE_DECLINED", "Estimate Declined", "Your estimate was declined. The work scope has been updated."),
        template("PAYMENT_RECORDED", "Payment Recorded", "Payment recorded successfully. {{message}}"),
        template("FEEDBACK_REQUEST", "Feedback Request", "Your service is complete. Share feedback when ready, {{name}}.")
    );

    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<Map<String, Object>> getTemplates() {
        ensureDefaultTemplates(false);
        return notificationTemplateRepository.findAll().stream()
            .sorted(Comparator.comparing(NotificationTemplate::getTemplateKey, String.CASE_INSENSITIVE_ORDER))
            .map(this::toMap)
            .toList();
    }

    public Map<String, Object> updateTemplate(String templateKey, Map<String, Object> payload, Long actorUserId) {
        NotificationTemplate template = notificationTemplateRepository.findByTemplateKeyIgnoreCase(templateKey)
            .orElseGet(() -> {
                NotificationTemplate created = new NotificationTemplate();
                created.setTemplateKey(templateKey.toUpperCase());
                return created;
            });

        template.setTemplateTitle(String.valueOf(payload.getOrDefault("templateTitle", template.getTemplateTitle() != null ? template.getTemplateTitle() : templateKey)));
        template.setTemplateBody(String.valueOf(payload.getOrDefault("templateBody", template.getTemplateBody() != null ? template.getTemplateBody() : "")));
        if (payload.containsKey("enabled")) {
            template.setEnabled(Boolean.valueOf(String.valueOf(payload.get("enabled"))));
        } else if (template.getEnabled() == null) {
            template.setEnabled(Boolean.TRUE);
        }

        NotificationTemplate saved = notificationTemplateRepository.save(template);
        auditLogService.log(actorUserId, "NOTIFICATION_TEMPLATE_UPDATED", "NOTIFICATION_TEMPLATE", saved.getId(), "ADMIN");
        return toMap(saved);
    }

    public List<Map<String, Object>> restoreDefaultTemplates(Long actorUserId) {
        ensureDefaultTemplates(true);
        auditLogService.log(actorUserId, "NOTIFICATION_TEMPLATES_RESET", "NOTIFICATION_TEMPLATE", null, "ADMIN");
        return getTemplates();
    }

    public String previewTemplate(String templateKey, Long userId) {
        ensureDefaultTemplates(false);
        User user = userId == null ? null : authRepository.findById(userId).orElse(null);
        return renderMessage(templateKey, user, "Test notification for " + templateKey + ".", Map.of(
            "status", templateKey,
            "name", user != null && user.getEmail() != null ? user.getEmail() : "Customer",
            "email", user != null ? user.getEmail() : "customer@example.com",
            "bookingId", "BOOK-TEST-001",
            "slotTime", "11 May 2026 10:30 AM",
            "message", "This is a test notification generated from the admin console."
        ));
    }

    public String renderMessage(String templateKey, User user, String fallbackMessage, Map<String, Object> variables) {
        ensureDefaultTemplates(false);
        NotificationTemplate template = notificationTemplateRepository.findByTemplateKeyIgnoreCase(templateKey)
            .orElse(null);

        if (template == null || Boolean.FALSE.equals(template.getEnabled()) || template.getTemplateBody() == null || template.getTemplateBody().isBlank()) {
            return fallbackMessage;
        }

        Map<String, Object> resolvedVariables = new LinkedHashMap<>();
        if (variables != null) {
            resolvedVariables.putAll(variables);
        }
        resolvedVariables.putIfAbsent("status", templateKey);
        resolvedVariables.putIfAbsent("message", fallbackMessage);
        resolvedVariables.putIfAbsent("name", user != null && user.getEmail() != null ? user.getEmail() : "Customer");
        resolvedVariables.putIfAbsent("email", user != null ? user.getEmail() : "customer@example.com");

        String rendered = template.getTemplateBody();
        for (Map.Entry<String, Object> entry : resolvedVariables.entrySet()) {
            rendered = rendered.replace("{{" + entry.getKey() + "}}", String.valueOf(entry.getValue()));
        }
        return rendered;
    }

    private void ensureDefaultTemplates(boolean overwriteExisting) {
        List<NotificationTemplate> toSave = new ArrayList<>();
        for (Map<String, Object> seed : DEFAULT_TEMPLATES) {
            String templateKey = String.valueOf(seed.get("templateKey"));
            NotificationTemplate template = notificationTemplateRepository.findByTemplateKeyIgnoreCase(templateKey)
                .orElseGet(() -> {
                    NotificationTemplate created = new NotificationTemplate();
                    created.setTemplateKey(templateKey);
                    return created;
                });
            boolean changed = template.getId() == null;

            if (template.getTemplateTitle() == null || template.getTemplateTitle().isBlank() || overwriteExisting) {
                template.setTemplateTitle(String.valueOf(seed.get("templateTitle")));
                changed = true;
            }
            if (template.getTemplateBody() == null || template.getTemplateBody().isBlank() || overwriteExisting) {
                template.setTemplateBody(String.valueOf(seed.get("templateBody")));
                changed = true;
            }
            if (template.getEnabled() == null || overwriteExisting) {
                template.setEnabled(Boolean.TRUE);
                changed = true;
            }
            if (changed) {
                toSave.add(template);
            }
        }
        if (!toSave.isEmpty()) {
            notificationTemplateRepository.saveAll(toSave);
        }
    }

    private static Map<String, Object> template(String key, String title, String body) {
        Map<String, Object> template = new LinkedHashMap<>();
        template.put("templateKey", key);
        template.put("templateTitle", title);
        template.put("templateBody", body);
        return template;
    }

    private Map<String, Object> toMap(NotificationTemplate template) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", template.getId());
        map.put("templateKey", template.getTemplateKey());
        map.put("templateTitle", template.getTemplateTitle());
        map.put("templateBody", template.getTemplateBody());
        map.put("enabled", template.getEnabled());
        map.put("createdAt", template.getCreatedAt());
        map.put("updatedAt", template.getUpdatedAt());
        return map;
    }
}
