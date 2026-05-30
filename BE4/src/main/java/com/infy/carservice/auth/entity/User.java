package com.infy.carservice.auth.entity;

import java.time.LocalDateTime;

import com.infy.carservice.common.enums.UserStatus;
import com.infy.carservice.common.enums.UserType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable=false,unique=true,length=100)
	private String email;
	
	@Column(nullable =false,length=255)
	private String password;
	
	@Column(length=15)
	private String phone;
	
	@Enumerated(EnumType.STRING)
	@Column(name="user_type",nullable=false)
	private UserType userType;
	
	
	@Enumerated(EnumType.STRING)
	@Column(nullable=false)
	private UserStatus status=UserStatus.ACTIVE;
	
	@Column(name="created_at",updatable=false)
	private LocalDateTime createdAt;
	
	
	@PrePersist
	public void prePersist() {
		this.createdAt=LocalDateTime.now();
	}
}
