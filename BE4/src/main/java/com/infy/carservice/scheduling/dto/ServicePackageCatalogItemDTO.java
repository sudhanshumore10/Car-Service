package com.infy.carservice.scheduling.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class ServicePackageCatalogItemDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean active;
    private String category;
    private BigDecimal taxPercent;
    private BigDecimal discount;
    private List<Long> serviceIds;
    private List<String> serviceNames;
}
