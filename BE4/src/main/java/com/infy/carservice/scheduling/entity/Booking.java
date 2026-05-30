
package com.infy.carservice.scheduling.entity;

import java.time.LocalDateTime;

import java.util.List;

import com.infy.carservice.common.enums.BookingStatus;

import com.infy.carservice.customer.entity.Customer;

import com.infy.carservice.vehicle.entity.Vehicle;

import com.infy.carservice.workshop.entity.WorkShop;

import jakarta.persistence.Column;

import jakarta.persistence.Entity;

import jakarta.persistence.EnumType;

import jakarta.persistence.Enumerated;

import jakarta.persistence.FetchType;

import jakarta.persistence.GeneratedValue;

import jakarta.persistence.GenerationType;

import jakarta.persistence.Id;

import jakarta.persistence.JoinColumn;

import jakarta.persistence.JoinTable;

import jakarta.persistence.ManyToMany;

import jakarta.persistence.ManyToOne;

import jakarta.persistence.Table;

import lombok.Getter;

import lombok.Setter;

@Entity

@Table(name = "bookings")

@Getter

@Setter

public class Booking {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @ManyToOne

    @JoinColumn(name = "workshop_id")

    private WorkShop workshop;

    @ManyToOne

    @JoinColumn(name = "customer_id")

    private Customer customer;

    @ManyToOne

    @JoinColumn(name = "vehicle_id")

    private Vehicle vehicle;

    @Column(name = "booking_time")

    private LocalDateTime bookingTime;

    @Column(name = "end_time")

    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)

    private BookingStatus status;

    @Column(name = "pickup_required")

    private Boolean pickupRequired = false;

    @ManyToMany(fetch = FetchType.EAGER)

    @JoinTable(

        name = "booking_services",

        joinColumns = @JoinColumn(name = "booking_id"),

        inverseJoinColumns = @JoinColumn(name = "service_id")

    )

    private List<CarService> services;
    
    

}




