package com.infy.carservice.common.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;

import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;

import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;

import jakarta.persistence.ManyToOne;

import jakarta.persistence.Table;

import lombok.Getter;

import lombok.Setter;

@Entity

@Table(name = "work_order_logs")

@Getter

@Setter

public class WorkOrderLog {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @ManyToOne

    @JoinColumn(name = "work_order_id")

    private WorkOrder workOrder;

    private String status;

    @Column(name = "timestamp")

    private LocalDateTime timestamp;

}