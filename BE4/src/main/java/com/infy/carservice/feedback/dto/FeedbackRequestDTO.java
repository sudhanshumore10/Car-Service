package com.infy.carservice.feedback.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequestDTO {
    private Long userId;
    private Long workOrderId;
    private Integer rating;
    private String comments;
    private String tags;
}
