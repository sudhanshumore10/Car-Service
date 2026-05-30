package com.infy.carservice.feedback.entity;

import java.time.LocalDateTime;

import com.infy.carservice.common.entity.WorkOrder;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "feedback")
@Getter
@Setter
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    private Integer rating;

    private String comments;

    @Column(length = 255)
    private String tags;

    @Column(name = "manager_response")
    private String managerResponse;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "manager_responded_at")
    private LocalDateTime managerRespondedAt;
}
