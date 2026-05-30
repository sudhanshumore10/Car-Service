package com.infy.carservice.feedback.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackEligibleDTO {
    private Long workOrderId;
    private Long bookingId;
    private String workshopName;
    private String vehicle;
    private String status;
}
