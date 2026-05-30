package com.infy.carservice.scheduling.entity;

import com.infy.carservice.workshop.entity.WorkShop;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;


@Data
@Entity(name = "SchedulingTechnician")
public class Technician {
	@Id
	@GeneratedValue
	private Long id;
	private String name;
	@ManyToOne 
	private WorkShop workshop;
	

}
