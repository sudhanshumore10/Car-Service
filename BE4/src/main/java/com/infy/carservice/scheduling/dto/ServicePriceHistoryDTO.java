package com.infy.carservice.scheduling.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ServicePriceHistoryDTO {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private LocalDateTime changedAt;
    private String changedBy;
}
