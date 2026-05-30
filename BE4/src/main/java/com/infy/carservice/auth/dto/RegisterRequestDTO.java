package com.infy.carservice.auth.dto;

import com.infy.carservice.common.enums.UserType;

import lombok.Data;

@Data
public class RegisterRequestDTO {
	
	private String fullName;
	private String email;
	private String password;
	private String phone;
	private UserType userType;
}
