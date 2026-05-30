package com.infy.carservice.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
	
	private String token;
	private Long userId;
	private String fullName;
	private String email;
	private String phoneNo;
	private String role;
	
}
