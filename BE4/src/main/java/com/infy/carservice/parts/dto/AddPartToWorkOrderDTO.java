package com.infy.carservice.parts.dto;

import lombok.Data;

@Data
public class AddPartToWorkOrderDTO {
    private Long partId;
    private Integer quantity;
}
