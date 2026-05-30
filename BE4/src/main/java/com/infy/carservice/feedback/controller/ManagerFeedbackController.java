package com.infy.carservice.feedback.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.feedback.dto.FeedbackManagerResponseDTO;
import com.infy.carservice.feedback.dto.FeedbackResponseDTO;
import com.infy.carservice.feedback.service.FeedbackService;

@RestController
@RequestMapping("/manager/feedback")
public class ManagerFeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback() {
        return ResponseEntity.ok(feedbackService.getAllFeedback());
    }

    @PutMapping("/{feedbackId}/response")
    public ResponseEntity<FeedbackResponseDTO> respondToFeedback(
            @PathVariable Long feedbackId,
            @RequestBody FeedbackManagerResponseDTO request) {
        return ResponseEntity.ok(feedbackService.respondToFeedback(feedbackId, request));
    }
}
