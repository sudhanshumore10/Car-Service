
package com.infy.carservice.scheduling.engine;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.infy.carservice.scheduling.dto.SlotDTO;
import com.infy.carservice.scheduling.entity.Booking;
import com.infy.carservice.scheduling.repository.BlackoutRepository;
import com.infy.carservice.scheduling.repository.BookingRepository;
import com.infy.carservice.scheduling.repository.ServiceBaysRepository;
import com.infy.carservice.scheduling.repository.TechnicianShiftRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;

@Component
public class CapacityEngine {

	private static final int SLOT_MINUTES = 45;

	@Autowired
	private BookingRepository bookingRepo;

	@Autowired
	private TechnicianShiftRepository shiftRepo;

	@Autowired
	private ServiceBaysRepository bayRepo;

	@Autowired
	private BlackoutRepository blackoutRepo;

	@Autowired
	private WorkshopRepository workshopRepo;

	public List<SlotDTO> getAvailability(Long workshopId, LocalDate date) {

		if (blackoutRepo.existsByWorkshopIdAndDate(workshopId, date)) {
			return Collections.emptyList();
		}

		WorkShop workshop = workshopRepo.findById(workshopId)
				.orElseThrow(() -> new RuntimeException("Workshop not found"));

		List<LocalTime> slots = generateSlots(
				workshop.getStartTime().toLocalTime(),
				workshop.getEndTime().toLocalTime());

		LocalDateTime dayStart = LocalDateTime.of(date, workshop.getStartTime().toLocalTime());
		LocalDateTime dayEnd   = LocalDateTime.of(date, workshop.getEndTime().toLocalTime());
		Map<LocalTime, Integer> occupied = mapOccupiedSlots(workshopId, dayStart, dayEnd);

		List<SlotDTO> result = new ArrayList<>();
		for (LocalTime slot : slots) {
			int capacity = getCapacity(workshopId, slot);
			int used = occupied.getOrDefault(slot, 0);
			int available = Math.max(0, capacity - used);
			result.add(new SlotDTO(
					LocalDateTime.of(date, slot),
					LocalDateTime.of(date, slot.plusMinutes(SLOT_MINUTES)),
					capacity,
					used,
					available));
		}
		return result;
	}

	// capacity = min(active bays, technicians on shift at that time)
	public int getCapacity(Long workshopId, LocalTime time) {
		int bays  = bayRepo.countByWorkshopId(workshopId);
		int techs = shiftRepo.countActiveTechnicians(workshopId, time);
		return Math.min(bays, techs);
	}

	private Map<LocalTime, Integer> mapOccupiedSlots(Long workshopId,
			LocalDateTime start, LocalDateTime end) {
		List<Booking> bookings = bookingRepo.findByWorkshopIdAndBookingTimeBetween(workshopId, start, end);
		Map<LocalTime, Integer> map = new HashMap<>();
		for (Booking b : bookings) {
			LocalTime s = b.getBookingTime().toLocalTime();
			LocalTime e = b.getEndTime().toLocalTime();
			LocalTime t = s;
			while (t.isBefore(e)) {
				map.put(t, map.getOrDefault(t, 0) + 1);
				t = t.plusMinutes(SLOT_MINUTES);
			}
		}
		return map;
	}

	private List<LocalTime> generateSlots(LocalTime start, LocalTime end) {
		List<LocalTime> slots = new ArrayList<>();
		LocalTime t = start;
		while (t.isBefore(end)) {
			slots.add(t);
			t = t.plusMinutes(SLOT_MINUTES);
		}
		return slots;
	}
}
