
package com.infy.carservice.parts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkOrderPartResponseDTO {
    private Long id;
    private Long workOrderId;
    private Long partId;
    private String partName;
    private String partSku;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
    private Boolean isBackorder;
    private Integer remainingStock;
}