package com.infy.carservice.common.dto;


import jakarta.validation.constraints.NotNull;

import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class UpdateWorkOrderStatusDTO {

    @NotNull

    private String status;

}













