package com.infy.carservice.scheduling.entity;

import java.time.LocalDateTime;

import com.infy.carservice.scheduling.enums.PickupStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="pickup_requests")
public class PickupRequest {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "booking_id")
	private Long bookingId;

	@Column(name = "address_id")
	private Long addressId;

	@Enumerated(EnumType.STRING)
	private PickupStatus status;   // REQUESTED, ASSIGNED, etc
	
	private String type;     // PICKUP / DROP

	@Column(name = "scheduled_time")
	private LocalDateTime scheduledTime;

	@Column(name = "completed_time")
	private LocalDateTime completedTime;

//	// GETTERS & SETTERS
//
//	public Long getId() { return id; }
//
//	public Long getBookingId() { return bookingId; }
//	public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
//
//	public Long getAddressId() { return addressId; }
//	public void setAddressId(Long addressId) { this.addressId = addressId; }
//
//	public PickupStatus getStatus() { return status; }
//	public void setStatus(String status) { this.status = status; }
//
//	public String getType() { return type; }
//	public void setType(String type) { this.type = type; }
//
//	public LocalDateTime getScheduledTime() { return scheduledTime; }
//	public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
//
//	public LocalDateTime getCompletedTime() { return completedTime; }
//	public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }
}
