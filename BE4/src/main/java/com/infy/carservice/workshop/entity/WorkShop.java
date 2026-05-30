package com.infy.carservice.workshop.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.infy.carservice.common.entity.Address;
import com.infy.carservice.common.entity.Manager;
import com.infy.carservice.common.entity.Technician;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="workshops")
public class WorkShop {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	private String name;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name="address_id")
	private Address address;
	
	@Column(name="open_time")
	private LocalDateTime startTime;
	
	@Column(name="close_time")
	private LocalDateTime endTime;
	
	@Column(name="serviceable_brands")
	private String serviceableBrands;
	
	@ManyToOne
	@JoinColumn(name="manager_id")
	private Manager manager;
	
	@OneToMany(mappedBy="workshop",cascade=CascadeType.ALL)
	private List<Technician> technician;
	
	
	
}
