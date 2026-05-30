package com.infy.carservice.scheduling.controller;

import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.SlotDTO;
import com.infy.carservice.scheduling.service.BookingService;

@RestController
@RequestMapping("/customer/scheduling")
public class CustomerSchedulingController {

@Autowired
private BookingService bookingService;

/**
 * US 06 — Customer views available slots
 * GET /customer/scheduling/slots?workshopId=1&serviceId=2&date=2026-05-10
 */
@GetMapping("/slots")
public List<SlotDTO> getAvailableSlots(
        @RequestParam Long workshopId,
        @RequestParam(required = false) Long serviceId,
        @RequestParam(required = false) String serviceIds,
        @RequestParam String date) {
    List<Long> ids = parseServiceIds(serviceId, serviceIds);
    return bookingService.getAvailableSlots(workshopId, ids, date);
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
