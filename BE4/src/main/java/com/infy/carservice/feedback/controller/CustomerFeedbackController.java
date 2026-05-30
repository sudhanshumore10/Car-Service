package com.infy.carservice.feedback.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.feedback.dto.FeedbackEligibleDTO;
import com.infy.carservice.feedback.dto.FeedbackRequestDTO;
import com.infy.carservice.feedback.dto.FeedbackResponseDTO;
import com.infy.carservice.feedback.service.FeedbackService;

@RestController
@RequestMapping("/customer/feedback")
public class CustomerFeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/eligible")
    public ResponseEntity<List<FeedbackEligibleDTO>> getEligible(@RequestParam Long userId) {
        return ResponseEntity.ok(feedbackService.getEligibleWorkOrders(userId));
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> getCustomerFeedback(@RequestParam Long userId) {
        return ResponseEntity.ok(feedbackService.getCustomerFeedback(userId));
    }

    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(@RequestBody FeedbackRequestDTO request) {
        return ResponseEntity.ok(feedbackService.submitFeedback(request));
    }
}
