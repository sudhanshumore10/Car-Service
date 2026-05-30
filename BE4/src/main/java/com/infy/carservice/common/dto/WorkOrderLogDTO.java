package com.infy.carservice.common.dto;

import java.time.LocalDateTime;

import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class WorkOrderLogDTO {

    private Long id;

    private String status;

    private LocalDateTime timestamp;

}