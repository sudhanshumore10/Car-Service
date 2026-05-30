

package com.infy.carservice.scheduling.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.SlotDTO;
import com.infy.carservice.scheduling.engine.CapacityEngine;
import com.infy.carservice.scheduling.service.BookingService;

@RestController
@RequestMapping("manager/scheduling")
public class SchedulingController {

	@Autowired
	private BookingService bookingService;

	@Autowired
	private CapacityEngine capacityEngine;
	@GetMapping("/availability")
	public List<SlotDTO> getAvailability(
			@RequestParam Long workshopId,
			@RequestParam String date) {
		return capacityEngine.getAvailability(workshopId, LocalDate.parse(date));
	}

	
	@GetMapping("/slots")
	public List<SlotDTO> getAvailableSlots(
			@RequestParam Long workshopId,
			@RequestParam(required = false) Long serviceId,
			@RequestParam(required = false) String serviceIds,
			@RequestParam String date) {
		return bookingService.getAvailableSlots(workshopId, parseServiceIds(serviceId, serviceIds), date);
	}

	private List<Long> parseServiceIds(Long serviceId, String serviceIds) {
		List<Long> ids = new ArrayList<>();
		if (serviceIds != null && !serviceIds.isBlank()) {
			for (String rawId : serviceIds.split(",")) {
				String trimmedId = rawId.trim();
				if (!trimmedId.isBlank()) {
					ids.add(Long.valueOf(trimmedId));
				}
			}
		}
		if (ids.isEmpty() && serviceId != null) {
			ids.add(serviceId);
		}
		return ids;
	}
}

