package com.infy.carservice.scheduling.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PickupStatusDTO {

private Long id;
private Long bookingId;
private String type;            // PICKUP / DROP
private String status;          // REQUESTED, ASSIGNED, EN_ROUTE, PICKED, DELIVERED
private Long addressId;
private LocalDateTime scheduledTime;
private LocalDateTime completedTime;
}