package com.infy.carservice.vehicle.entity;

import com.infy.carservice.common.entity.Address;
import com.infy.carservice.customer.entity.Customer;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="vehicles")
@Data
public class Vehicle  {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long vehicleId;
	
	@ManyToOne
	@JoinColumn(name="customer_id")
	private Customer customer;
	
	@OneToOne(cascade=CascadeType.ALL)
	@JoinColumn(name="vehicle_docid")
	private VehicleDocument vehicleDocument;
	
	private String make;
	private String model;
	private Integer year;
	
	@Column(unique = true)
	private String vin;
	
	@Column(unique = true)
	private String plateNumber;
	
	private Boolean isActive=true;
	
//	private Boolean isDefault = false;
	

	
}
