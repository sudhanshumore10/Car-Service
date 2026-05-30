package com.infy.carservice.common.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.SystemSetting;
import com.infy.carservice.common.repository.SystemSettingRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SystemSettingService {

    public static final String KEY_PASSWORD_MIN_LENGTH = "PASSWORD_MIN_LENGTH";
    public static final String KEY_PASSWORD_REQUIRE_UPPERCASE = "PASSWORD_REQUIRE_UPPERCASE";
    public static final String KEY_PASSWORD_REQUIRE_NUMBER = "PASSWORD_REQUIRE_NUMBER";
    public static final String KEY_PASSWORD_REQUIRE_SPECIAL = "PASSWORD_REQUIRE_SPECIAL";
    public static final String KEY_SESSION_TIMEOUT_MINUTES = "SESSION_TIMEOUT_MINUTES";
    public static final String KEY_BRAND_APP_NAME = "BRAND_APP_NAME";
    public static final String KEY_BRAND_PRIMARY_COLOR = "BRAND_PRIMARY_COLOR";
    public static final String KEY_SYSTEM_READ_ONLY_MODE = "SYSTEM_READ_ONLY_MODE";

    private static final List<Map<String, String>> DEFAULT_SETTINGS = List.of(
        setting(KEY_PASSWORD_MIN_LENGTH, "8", "Minimum password length for new registrations"),
        setting(KEY_PASSWORD_REQUIRE_UPPERCASE, "true", "Require at least one uppercase letter"),
        setting(KEY_PASSWORD_REQUIRE_NUMBER, "true", "Require at least one number"),
        setting(KEY_PASSWORD_REQUIRE_SPECIAL, "false", "Require at least one special character"),
        setting(KEY_SESSION_TIMEOUT_MINUTES, "60", "JWT session timeout in minutes"),
        setting(KEY_BRAND_APP_NAME, "CarService", "Application name shown on UI"),
        setting(KEY_BRAND_PRIMARY_COLOR, "#ff5b2e", "Primary theme color"),
        setting(KEY_SYSTEM_READ_ONLY_MODE, "false", "When enabled, non-admin write APIs are blocked")
    );

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${spring.application.name:carservice}")
    private String applicationName;

    public List<Map<String, Object>> getSettings() {
        ensureDefaultSettings();
        return systemSettingRepository.findAll().stream()
            .sorted(Comparator.comparing(SystemSetting::getSettingKey, String.CASE_INSENSITIVE_ORDER))
            .map(this::toMap)
            .toList();
    }

    public Map<String, Object> updateSetting(String settingKey, Map<String, Object> payload, Long actorUserId) {
        SystemSetting setting = systemSettingRepository.findBySettingKeyIgnoreCase(settingKey)
            .orElseGet(() -> {
                SystemSetting created = new SystemSetting();
                created.setSettingKey(settingKey.toUpperCase());
                return created;
            });

        setting.setSettingValue(String.valueOf(payload.getOrDefault("settingValue", setting.getSettingValue() != null ? setting.getSettingValue() : "")));
        if (payload.containsKey("settingDescription")) {
            setting.setSettingDescription(String.valueOf(payload.get("settingDescription")));
        }

        SystemSetting saved = systemSettingRepository.save(setting);
        auditLogService.log(actorUserId, "SYSTEM_SETTING_UPDATED", "SYSTEM_SETTING", saved.getId(), "ADMIN");
        return toMap(saved);
    }

    public Map<String, Object> exportSettingsSnapshot() {
        ensureDefaultSettings();
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("exportedAt", LocalDateTime.now());
        snapshot.put("applicationName", getBrandAppName());
        snapshot.put("settings", getSettings());
        snapshot.put("systemInfo", getSystemInfo());
        return snapshot;
    }

    public List<Map<String, Object>> importSettingsSnapshot(Map<String, Object> payload, Long actorUserId) {
        ensureDefaultSettings();
        Object settingsObject = payload == null ? null : payload.get("settings");
        List<Map<String, Object>> importedSettings = normalizeImportedSettings(settingsObject);
        if (importedSettings.isEmpty()) {
            throw new RuntimeException("Settings import payload is empty.");
        }

        for (Map<String, Object> imported : importedSettings) {
            String settingKey = String.valueOf(imported.getOrDefault("settingKey", "")).trim();
            if (settingKey.isBlank()) {
                continue;
            }

            SystemSetting setting = systemSettingRepository.findBySettingKeyIgnoreCase(settingKey)
                .orElseGet(() -> {
                    SystemSetting created = new SystemSetting();
                    created.setSettingKey(settingKey.toUpperCase());
                    return created;
                });

            setting.setSettingValue(String.valueOf(imported.getOrDefault("settingValue", setting.getSettingValue() != null ? setting.getSettingValue() : "")));
            if (imported.containsKey("settingDescription")) {
                setting.setSettingDescription(String.valueOf(imported.get("settingDescription")));
            }
            systemSettingRepository.save(setting);
        }

        auditLogService.log(actorUserId, "SYSTEM_SETTINGS_IMPORTED", "SYSTEM_SETTING", null, "ADMIN");
        return getSettings();
    }

    public boolean isReadOnlyModeEnabled() {
        return getBooleanSetting(KEY_SYSTEM_READ_ONLY_MODE, false);
    }

    public int getSessionTimeoutMinutes() {
        return getIntSetting(KEY_SESSION_TIMEOUT_MINUTES, 60);
    }

    public int getPasswordMinLength() {
        return getIntSetting(KEY_PASSWORD_MIN_LENGTH, 8);
    }

    public boolean requireUppercase() {
        return getBooleanSetting(KEY_PASSWORD_REQUIRE_UPPERCASE, true);
    }

    public boolean requireNumber() {
        return getBooleanSetting(KEY_PASSWORD_REQUIRE_NUMBER, true);
    }

    public boolean requireSpecial() {
        return getBooleanSetting(KEY_PASSWORD_REQUIRE_SPECIAL, false);
    }

    public String getBrandAppName() {
        return getStringSetting(KEY_BRAND_APP_NAME, "CarService");
    }

    public String getBrandPrimaryColor() {
        return getStringSetting(KEY_BRAND_PRIMARY_COLOR, "#ff5b2e");
    }

    public void validatePassword(String password) {
        if (password == null || password.length() < getPasswordMinLength()) {
            throw new RuntimeException("Password must be at least " + getPasswordMinLength() + " characters long.");
        }
        if (requireUppercase() && password.chars().noneMatch(Character::isUpperCase)) {
            throw new RuntimeException("Password must contain at least one uppercase letter.");
        }
        if (requireNumber() && password.chars().noneMatch(Character::isDigit)) {
            throw new RuntimeException("Password must contain at least one number.");
        }
        if (requireSpecial() && password.chars().allMatch(ch -> Character.isLetterOrDigit(ch))) {
            throw new RuntimeException("Password must contain at least one special character.");
        }
    }

    public Map<String, Object> getSystemInfo() {
        ensureDefaultSettings();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("applicationName", getBrandAppName());
        map.put("backendService", applicationName);
        map.put("javaVersion", System.getProperty("java.version"));
        map.put("osName", System.getProperty("os.name"));
        map.put("serverTime", LocalDateTime.now());
        map.put("sessionTimeoutMinutes", getSessionTimeoutMinutes());
        map.put("readOnlyMode", isReadOnlyModeEnabled());
        map.put("brandPrimaryColor", getBrandPrimaryColor());
        map.put("passwordPolicy", Map.of(
            "minLength", getPasswordMinLength(),
            "requireUppercase", requireUppercase(),
            "requireNumber", requireNumber(),
            "requireSpecial", requireSpecial()
        ));
        return map;
    }

    public Map<String, Object> getPublicConfig() {
        ensureDefaultSettings();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("applicationName", getBrandAppName());
        map.put("brandPrimaryColor", getBrandPrimaryColor());
        map.put("sessionTimeoutMinutes", getSessionTimeoutMinutes());
        map.put("readOnlyMode", isReadOnlyModeEnabled());
        return map;
    }

    public boolean getBooleanSetting(String key, boolean defaultValue) {
        return Boolean.parseBoolean(getStringSetting(key, String.valueOf(defaultValue)));
    }

    public int getIntSetting(String key, int defaultValue) {
        try {
            return Integer.parseInt(getStringSetting(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    public String getStringSetting(String key, String defaultValue) {
        return systemSettingRepository.findBySettingKeyIgnoreCase(key)
            .map(SystemSetting::getSettingValue)
            .filter(value -> value != null && !value.isBlank())
            .orElse(defaultValue);
    }

    private void ensureDefaultSettings() {
        for (Map<String, String> defaultSetting : DEFAULT_SETTINGS) {
            String settingKey = defaultSetting.get("settingKey");
            if (systemSettingRepository.findBySettingKeyIgnoreCase(settingKey).isEmpty()) {
                SystemSetting created = new SystemSetting();
                created.setSettingKey(settingKey);
                created.setSettingValue(defaultSetting.get("settingValue"));
                created.setSettingDescription(defaultSetting.get("settingDescription"));
                systemSettingRepository.save(created);
            }
        }
    }

    private List<Map<String, Object>> normalizeImportedSettings(Object settingsObject) {
        List<Map<String, Object>> normalized = new ArrayList<>();
        if (settingsObject instanceof Collection<?> collection) {
            for (Object item : collection) {
                if (item instanceof Map<?, ?> map) {
                    normalized.add(copyImportedSetting(map));
                }
            }
            return normalized;
        }
        if (settingsObject instanceof Map<?, ?> rawMap) {
            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("settingKey", String.valueOf(entry.getKey()));
                if (entry.getValue() instanceof Map<?, ?> nested) {
                    item.put("settingValue", nested.get("settingValue"));
                    item.put("settingDescription", nested.get("settingDescription"));
                } else {
                    item.put("settingValue", entry.getValue());
                }
                normalized.add(item);
            }
        }
        return normalized;
    }

    private Map<String, Object> copyImportedSetting(Map<?, ?> source) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("settingKey", source.get("settingKey"));
        item.put("settingValue", source.get("settingValue"));
        item.put("settingDescription", source.get("settingDescription"));
        return item;
    }

    private static Map<String, String> setting(String key, String value, String description) {
        Map<String, String> item = new LinkedHashMap<>();
        item.put("settingKey", key);
        item.put("settingValue", value);
        item.put("settingDescription", description);
        return item;
    }

    private Map<String, Object> toMap(SystemSetting setting) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", setting.getId());
        map.put("settingKey", setting.getSettingKey());
        map.put("settingValue", setting.getSettingValue());
        map.put("settingDescription", setting.getSettingDescription());
        map.put("updatedAt", setting.getUpdatedAt());
        return map;
    }
}
