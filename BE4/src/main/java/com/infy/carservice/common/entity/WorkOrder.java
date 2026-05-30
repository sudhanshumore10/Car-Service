package com.infy.carservice.common.entity;

import java.time.LocalDateTime;

import com.infy.carservice.scheduling.entity.Booking;

import jakarta.persistence.Column;

import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;

import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;

import jakarta.persistence.ManyToOne;

import jakarta.persistence.OneToOne;

import jakarta.persistence.Table;

import lombok.Getter;

import lombok.Setter;

@Entity

@Table(name = "work_orders")

@Getter

@Setter

public class WorkOrder {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @OneToOne

    @JoinColumn(name = "booking_id")

    private Booking booking;

    @ManyToOne

    @JoinColumn(name = "assigned_technician", referencedColumnName = "id")

    private Technician assignedTechnician;

    @Column(name = "status")

    private String status;

    @Column(name = "created_at")

    private LocalDateTime createdAt;

}