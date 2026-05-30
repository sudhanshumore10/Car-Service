//package com.infy.carservice.scheduling.entity;
//
//import java.time.LocalTime;
//
//import com.infy.carservice.common.entity.Address;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import jakarta.persistence.JoinColumn;
//import jakarta.persistence.ManyToOne;
//import jakarta.persistence.Table;
//import lombok.Getter;
//import lombok.Setter;
//
//@Entity
//@Table(name="workshops")
//@Getter
//@Setter
//public class Workshop {
//	@Id
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
//	private Long id;
//	
//	private String name;
//
//	@Column(name="open_time")
//	private LocalTime openTime;
//	
//	@Column(name="close_time")
//	private LocalTime closeTime;
//	
//	@Column(name="serviceable_brands")
//	private String serviceableBrands;
//	
//	@ManyToOne
//	@JoinColumn(name="address_id")
//	private Address address;
//
//}
