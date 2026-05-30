package com.infy.carservice.parts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PartResponseDTO {
    private Long id;
    private String name;
    private String sku;
    private BigDecimal price;
    private Integer stock;
}

