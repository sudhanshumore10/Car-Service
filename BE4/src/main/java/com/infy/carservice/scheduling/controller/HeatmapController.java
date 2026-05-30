

package com.infy.carservice.scheduling.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.entity.Booking;
import com.infy.carservice.scheduling.repository.BookingRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;

@RestController
@RequestMapping("/manager/heatmap")
public class HeatmapController {

	private static final int SLOT_MINUTES = 60;

	@Autowired
	private BookingRepository bookingRepo;

	@Autowired
	private WorkshopRepository workshopRepo;

	@GetMapping("/{workshopId}")
	public Map<String, Integer> getHeatmap(
			@PathVariable Long workshopId,
			@RequestParam String date) {

		LocalDate localDate = LocalDate.parse(date);

		WorkShop workshop = workshopRepo.findById(workshopId)
				.orElseThrow(() -> new RuntimeException("Workshop not found"));

		LocalTime open  = workshop.getStartTime().toLocalTime();
		LocalTime close = workshop.getEndTime().toLocalTime();

		LocalDateTime dayStart = LocalDateTime.of(localDate, open);
		LocalDateTime dayEnd   = LocalDateTime.of(localDate, close);

		List<Booking> bookings = bookingRepo
				.findByWorkshopIdAndBookingTimeBetween(workshopId, dayStart, dayEnd);

		// Build hourly slot map (08:00, 09:00, ...)
		Map<String, Integer> heatmap = new LinkedHashMap<>();
		LocalTime slot = open;
		while (slot.isBefore(close)) {
			heatmap.put(String.format("%02d:00", slot.getHour()), 0);
			slot = slot.plusMinutes(SLOT_MINUTES);
		}

		// Count bookings per slot
		for (Booking b : bookings) {
			if (b.getStatus() != null && b.getStatus().name().equals("CANCELLED")) continue;
			LocalTime s = b.getBookingTime().toLocalTime();
			LocalTime e = b.getEndTime().toLocalTime();
			LocalTime t = LocalTime.of(s.getHour(), 0);
			while (t.isBefore(e) && t.isBefore(close)) {
				String key = String.format("%02d:00", t.getHour());
				heatmap.computeIfPresent(key, (k, v) -> v + 1);
				t = t.plusMinutes(SLOT_MINUTES);
			}
		}

		return heatmap;
	}
}

