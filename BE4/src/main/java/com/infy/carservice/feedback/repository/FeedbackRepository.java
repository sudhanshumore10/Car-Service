package com.infy.carservice.feedback.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infy.carservice.feedback.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByWorkOrderId(Long workOrderId);

    List<Feedback> findByWorkOrderBookingCustomerId(Long customerId);
}
