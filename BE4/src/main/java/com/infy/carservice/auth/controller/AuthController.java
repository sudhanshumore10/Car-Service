package com.infy.carservice.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.auth.dto.AuthResponseDTO;
import com.infy.carservice.auth.dto.LoginRequestDTO;
import com.infy.carservice.auth.dto.RegisterRequestDTO;
import com.infy.carservice.auth.service.AuthServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins="http://localhost:3000")
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
	
	@Autowired
	private AuthServiceImpl authService;
	
	@PostMapping("/register")
	public ResponseEntity<AuthResponseDTO> register(@RequestBody RegisterRequestDTO registerDTO) {
		return ResponseEntity.ok(authService.register(registerDTO));
	}
	
	
	@PostMapping("/login")
	public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginDTO) {
		return ResponseEntity.ok(authService.login(loginDTO));
	}
	
//	
//	@PostMapping("/logout")
//	public void logout() {
//		
//	}
	

}
