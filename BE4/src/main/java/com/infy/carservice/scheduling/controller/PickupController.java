package com.infy.carservice.scheduling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.UpdatePickupStatusDTO;
import com.infy.carservice.scheduling.service.BookingService;

@RestController
@RequestMapping("/pickup")
public class PickupController {
	
	@Autowired
	private BookingService bookingService;
	
	@PutMapping("/status")
	public String updateStatus(@RequestBody UpdatePickupStatusDTO dto) {
		bookingService.updatePickupStatus(dto.getRequestId(), dto.getStatus());
		return "Status updated successfully";
	}
}
