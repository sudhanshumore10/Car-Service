package com.infy.carservice.common.dto;

import java.time.LocalDateTime;

import java.math.BigDecimal;

import java.util.List;

import java.util.Map;

import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class WorkOrderResponseDTO {

    private Long workOrderId;

    private Long bookingId;

    private Long workshopId;

    private String workshopName;

    private String customerName;

    private String vehicleMake;

    private String vehicleModel;

    private String vehiclePlateNumber;

    private Long technicianId;

    private String technicianName;

    private String status;

    private LocalDateTime createdAt;

    private List<WorkOrderLogDTO> statusHistory;

    private List<String> diagnosisChecklist;

    private String diagnosisNotes;

    private List<Map<String, Object>> estimateItems;

    private List<Map<String, Object>> estimateHistory;

    private BigDecimal estimateSubtotal;

    private BigDecimal estimateTax;

    private BigDecimal estimateDiscount;

    private BigDecimal estimateTotal;

    private Integer estimateVersion;

    private String estimateStatus;

    private String approvalStatus;

    private LocalDateTime estimateSentAt;

    private LocalDateTime approvalAt;

    private Boolean canConvertToJob;

}
