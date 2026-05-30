
package com.infy.carservice.scheduling.dto;

import java.time.LocalDateTime;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

import lombok.Setter;

@Getter

@Setter

public class CreateBookingDTO {

    @NotNull(message = "User ID is required")

    private Long userId;         // logged-in user's ID from localStorage

    @NotNull(message = "Vehicle is required")

    private Long vehicleId;

    @NotNull(message = "Workshop is required")

    private Long workshopId;

    @NotNull(message = "Booking time is required")

    private LocalDateTime bookingTime;

    @NotNull(message = "At least one service must be selected")

    private List<Long> serviceIds;

    private Boolean pickupRequired = false;
    
    private Long pickupAddressId;
    
    private Long dropAddressId;
    
    private LocalDateTime pickupTime;
    private LocalDateTime dropTime;
    


}













































































































































































































