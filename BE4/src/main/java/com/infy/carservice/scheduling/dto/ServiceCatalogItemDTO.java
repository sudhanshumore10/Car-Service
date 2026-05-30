package com.infy.carservice.scheduling.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ServiceCatalogItemDTO {
    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Integer bufferMinutes;
    private BigDecimal basePrice;
    private Boolean active;
    private String category;
    private String tags;
    private String whatIncluded;
    private BigDecimal taxPercent;
    private BigDecimal discount;
}
