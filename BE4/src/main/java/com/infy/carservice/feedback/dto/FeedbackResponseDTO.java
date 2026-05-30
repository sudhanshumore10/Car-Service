package com.infy.carservice.feedback.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackResponseDTO {
    private Long id;
    private Long workOrderId;
    private Long bookingId;
    private String customerName;
    private String workshopName;
    private String vehicle;
    private Integer rating;
    private String comments;
    private String tags;
    private String managerResponse;
    private LocalDateTime submittedAt;
    private LocalDateTime managerRespondedAt;
}
