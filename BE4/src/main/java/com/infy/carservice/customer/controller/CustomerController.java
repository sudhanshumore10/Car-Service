package com.infy.carservice.customer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.infy.carservice.auth.controller.AuthController;
import com.infy.carservice.customer.dto.CustomerResponseDTO;
import com.infy.carservice.customer.dto.CustomerUpdateDTO;
import com.infy.carservice.customer.service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/customer")
@CrossOrigin(origins="http://localhost:3000")
@RequiredArgsConstructor 
public class CustomerController {

	
	@Autowired
	private  CustomerService customerService;

	
	@PutMapping("/profile/{userId}")
	public ResponseEntity<CustomerResponseDTO> updateProfile(@PathVariable Long userId,@RequestBody CustomerUpdateDTO dto){
		System.out.println("KUnal");
		return ResponseEntity.ok(customerService.updateProfile(userId, dto));
	}
	
	@GetMapping("/{userId}")
	public ResponseEntity<CustomerResponseDTO> getCustomerDetails(@PathVariable Long userId){
		return ResponseEntity.ok(customerService.getByUserId(userId));
	}
	  
}
