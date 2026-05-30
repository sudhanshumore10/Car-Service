package com.infy.carservice.common.entity;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.workshop.entity.WorkShop;

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
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "technician")
@Data
public class Technician {
	@Id
	@GeneratedValue(strategy =GenerationType.IDENTITY)
	@Column(name="id")
	private Long technicianId;
	
	@OneToOne
	@JoinColumn(name="user_id")
	private User user;
	
	
	private String technicianName;
	
	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name="address_id")
	private Address address;
	
	@Column(length=15)
	private String phone;
	
	@ManyToOne
	@JoinColumn(name="workshop_id")
	private WorkShop workshop;
	
	private String specialization;
	
}

