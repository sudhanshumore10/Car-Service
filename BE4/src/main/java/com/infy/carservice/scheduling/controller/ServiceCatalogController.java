package com.infy.carservice.scheduling.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.AddonCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServiceCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServicePackageCatalogItemDTO;
import com.infy.carservice.scheduling.service.CatalogManagementService;

@RestController
@RequestMapping("/catalog")
public class ServiceCatalogController {

    @Autowired
    private CatalogManagementService catalogManagementService;

    @GetMapping("/services")
    public ResponseEntity<List<ServiceCatalogItemDTO>> getServices() {
        return ResponseEntity.ok(catalogManagementService.getCustomerServices());
    }

    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackageCatalogItemDTO>> getPackages() {
        return ResponseEntity.ok(catalogManagementService.getCustomerPackages());
    }

    @GetMapping("/addons")
    public ResponseEntity<List<AddonCatalogItemDTO>> getAddOns() {
        return ResponseEntity.ok(catalogManagementService.getCustomerAddOns());
    }
}
