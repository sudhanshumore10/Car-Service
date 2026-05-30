package com.infy.carservice.scheduling.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="Services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarService {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String name;
	private String description;
	@Column(name="base_price")
	private BigDecimal basePrice;
	@Column(name="duration_minutes")
	private int durationMinutes;
	@Column(name="buffer_minutes")
	private int bufferMinutes;
	@Column(name="is_active")
	private Boolean isActive = true;

}
