
package com.infy.carservice.scheduling.dto;

import java.time.LocalDateTime;

import java.util.List;

import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class BookingResponseDTO {

    private Long id;

    private Long workshopId;

    private String workshopName;

    private Long vehicleId;

    private String vehicleMake;

    private String vehicleModel;

    private String vehiclePlateNumber;

    private LocalDateTime bookingTime;

    private LocalDateTime endTime;

    private String status;

    private Boolean pickupRequired;
    
    private LocalDateTime pickupTime;
    private LocalDateTime dropTime;
    
    private String pickupStatus;
    private String dropStatus;
    
    private String referenceNumber;

    private List<String> serviceNames;

}































































































































































































