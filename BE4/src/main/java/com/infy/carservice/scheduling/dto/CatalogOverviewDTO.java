package com.infy.carservice.scheduling.dto;

import java.util.List;

import lombok.Data;

@Data
public class CatalogOverviewDTO {
    private List<ServiceCatalogItemDTO> services;
    private List<ServicePackageCatalogItemDTO> packages;
    private List<AddonCatalogItemDTO> addOns;
    private List<ServicePriceHistoryDTO> priceHistory;
}
