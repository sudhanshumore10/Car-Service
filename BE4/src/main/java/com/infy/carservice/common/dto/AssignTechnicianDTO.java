package com.infy.carservice.common.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class AssignTechnicianDTO {

    @NotNull

    private Long technicianId;

}
