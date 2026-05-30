package com.infy.carservice.scheduling.entity;

import java.time.LocalDate;

import com.infy.carservice.workshop.entity.WorkShop;

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
@Table(name="blackout_dates")
@Getter
@Setter
public class BlackoutDate {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
//	@JoinColumn(name="workshop_id")
	private WorkShop workshop;
	
	private LocalDate date;
	
	private String reason;

}
