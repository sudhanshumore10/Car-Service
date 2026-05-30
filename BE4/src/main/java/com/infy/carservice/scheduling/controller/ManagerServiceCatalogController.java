package com.infy.carservice.scheduling.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.AddonCatalogItemDTO;
import com.infy.carservice.scheduling.dto.CatalogOverviewDTO;
import com.infy.carservice.scheduling.dto.ServiceCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServicePackageCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServicePriceHistoryDTO;
import com.infy.carservice.scheduling.service.CatalogManagementService;

@RestController
@RequestMapping("/manager/catalog")
public class ManagerServiceCatalogController {

    @Autowired
    private CatalogManagementService catalogManagementService;

    @GetMapping("/overview")
    public ResponseEntity<CatalogOverviewDTO> getOverview() {
        return ResponseEntity.ok(catalogManagementService.getManagerOverview());
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceCatalogItemDTO>> getAllServices() {
        return ResponseEntity.ok(catalogManagementService.getManagerServices());
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceCatalogItemDTO> createService(
            @RequestBody ServiceCatalogItemDTO dto,
            @RequestParam(required = false) String changedBy) {
        return ResponseEntity.ok(catalogManagementService.createService(dto, changedBy));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceCatalogItemDTO> updateService(
            @PathVariable Long id,
            @RequestBody ServiceCatalogItemDTO dto,
            @RequestParam(required = false) String changedBy) {
        return ResponseEntity.ok(catalogManagementService.updateService(id, dto, changedBy));
    }

    @PatchMapping("/services/{id}/active")
    public ResponseEntity<ServiceCatalogItemDTO> updateActiveStatus(
            @PathVariable Long id,
            @RequestBody ServiceCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.updateServiceActive(id, dto.getActive()));
    }

    @GetMapping("/packages")
    public ResponseEntity<List<ServicePackageCatalogItemDTO>> getPackages() {
        return ResponseEntity.ok(catalogManagementService.getManagerPackages());
    }

    @PostMapping("/packages")
    public ResponseEntity<ServicePackageCatalogItemDTO> createPackage(@RequestBody ServicePackageCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.createPackage(dto));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<ServicePackageCatalogItemDTO> updatePackage(
            @PathVariable Long id,
            @RequestBody ServicePackageCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.updatePackage(id, dto));
    }

    @PatchMapping("/packages/{id}/active")
    public ResponseEntity<ServicePackageCatalogItemDTO> updatePackageActive(
            @PathVariable Long id,
            @RequestBody ServicePackageCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.updatePackageActive(id, dto.getActive()));
    }

    @GetMapping("/addons")
    public ResponseEntity<List<AddonCatalogItemDTO>> getAddOns() {
        return ResponseEntity.ok(catalogManagementService.getManagerAddOns());
    }

    @PostMapping("/addons")
    public ResponseEntity<AddonCatalogItemDTO> createAddOn(@RequestBody AddonCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.createAddOn(dto));
    }

    @PutMapping("/addons/{id}")
    public ResponseEntity<AddonCatalogItemDTO> updateAddOn(
            @PathVariable Long id,
            @RequestBody AddonCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.updateAddOn(id, dto));
    }

    @PatchMapping("/addons/{id}/active")
    public ResponseEntity<AddonCatalogItemDTO> updateAddOnActive(
            @PathVariable Long id,
            @RequestBody AddonCatalogItemDTO dto) {
        return ResponseEntity.ok(catalogManagementService.updateAddOnActive(id, dto.getActive()));
    }

    @GetMapping("/price-history")
    public ResponseEntity<List<ServicePriceHistoryDTO>> getPriceHistory() {
        return ResponseEntity.ok(catalogManagementService.getPriceHistory());
    }
}
