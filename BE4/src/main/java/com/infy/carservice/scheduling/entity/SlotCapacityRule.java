package com.infy.carservice.scheduling.entity;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SlotCapacityRule {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	
	@Column(name = "workshop_id")
	private Long workshopId;
	
	private LocalTime startTime;
	
	private LocalTime endTime;

	private int maxCapacity;
}
