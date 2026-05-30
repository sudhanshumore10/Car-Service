package com.infy.carservice.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.service.SystemSettingService;

@RestController
@RequestMapping("/system")
public class PublicConfigController {

    private final SystemSettingService systemSettingService;

    public PublicConfigController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @GetMapping("/public-config")
    public ResponseEntity<?> getPublicConfig() {
        return ResponseEntity.ok(systemSettingService.getPublicConfig());
    }
}
