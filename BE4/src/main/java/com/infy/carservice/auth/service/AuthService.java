package com.infy.carservice.auth.service;

import com.infy.carservice.auth.dto.AuthResponseDTO;
import com.infy.carservice.auth.dto.LoginRequestDTO;
import com.infy.carservice.auth.dto.RegisterRequestDTO;

public interface AuthService {
	
	AuthResponseDTO register(RegisterRequestDTO request);
	
	AuthResponseDTO login(LoginRequestDTO request);
}
