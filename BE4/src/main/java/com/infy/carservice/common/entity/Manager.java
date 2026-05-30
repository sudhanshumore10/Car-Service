package com.infy.carservice.common.entity;

import java.util.List;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.workshop.entity.WorkShop;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="service_managers")
public class Manager{
	
	@Id
	@GeneratedValue(strategy =GenerationType.IDENTITY)
	private Long id;
	
	private String fullName;
	
	@OneToOne(cascade=CascadeType.ALL)
	@JoinColumn(name="user_id")
	private User user;
	
	
	@OneToMany(mappedBy ="manager",cascade=CascadeType.ALL)
	private List<WorkShop> workShops;
	
}
