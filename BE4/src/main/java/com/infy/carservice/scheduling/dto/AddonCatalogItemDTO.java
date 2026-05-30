package com.infy.carservice.scheduling.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class AddonCatalogItemDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
    private Boolean active;
    private Integer durationMinutes;
    private List<Long> excludedAddonIds;
    private List<String> excludedAddonNames;
}
