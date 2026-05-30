package com.infy.carservice.scheduling.entity;

import java.time.LocalTime;

import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.workshop.entity.WorkShop;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="service_bays")
@Data
@Getter
@Setter
public class ServiceBays {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name="workshop_id")
	private WorkShop workshop;
	
	private String bayName;
	
//	@ManyToOne
//	@JoinColumn(name="technician_id")
//	private Technician technician;
//	
//	@Column(name="shift_start")
//	private  LocalTime shiftStart;
//	
//	@Column(name="shift_end")
//	private LocalTime shiftEnd;

}
