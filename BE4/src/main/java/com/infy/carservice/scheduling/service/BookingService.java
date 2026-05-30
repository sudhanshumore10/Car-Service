

package com.infy.carservice.scheduling.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.enums.BookingStatus;
import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;
import com.infy.carservice.exception.InfyCarServiceException;
import com.infy.carservice.scheduling.dto.BookingResponseDTO;
import com.infy.carservice.scheduling.dto.CreateBookingDTO;
import com.infy.carservice.scheduling.dto.PickupStatusDTO;
import com.infy.carservice.scheduling.dto.SlotDTO;
import com.infy.carservice.scheduling.engine.CapacityEngine;
import com.infy.carservice.scheduling.entity.Booking;
import com.infy.carservice.scheduling.entity.CarService;
import com.infy.carservice.scheduling.entity.PickupRequest;
import com.infy.carservice.scheduling.entity.SlotCapacityRule;
import com.infy.carservice.scheduling.enums.PickupStatus;
import com.infy.carservice.scheduling.repository.BlackoutRepository;
import com.infy.carservice.scheduling.repository.BookingRepository;
import com.infy.carservice.scheduling.repository.PickupRequestRepository;
import com.infy.carservice.scheduling.repository.ServiceRepository;
import com.infy.carservice.scheduling.repository.SlotCapacityRuleRepository;
import com.infy.carservice.vehicle.entity.Vehicle;
import com.infy.carservice.vehicle.repository.VehicleRepository;
import com.infy.carservice.workshop.entity.WorkShop;
import com.infy.carservice.workshop.repository.WorkshopRepository;
import com.infy.carservice.common.service.WorkOrderService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class BookingService {

	@Autowired private BookingRepository bookingRepo;
	@Autowired private ServiceRepository serviceRepo;
	@Autowired private CustomerRepository customerRepo;
	@Autowired private VehicleRepository vehicleRepo;
	@Autowired private WorkshopRepository workshopRepo;
	@Autowired private SlotCapacityRuleRepository ruleRepo;
	@Autowired private BlackoutRepository blackoutRepo;
	@Autowired private CapacityEngine capacityEngine;
	@Autowired @Lazy private WorkOrderService workOrderService;
	@Autowired private PickupRequestRepository pickupRequestRepository;

	@Transactional
	public BookingResponseDTO createBooking(CreateBookingDTO dto) {

		Customer customer = customerRepo.findByUserId(dto.getUserId());
		if (customer == null)
			throw new InfyCarServiceException("Customer not found for userId: " + dto.getUserId());

		Vehicle vehicle = vehicleRepo.findById(dto.getVehicleId())
				.orElseThrow(() -> new InfyCarServiceException("Vehicle not found: " + dto.getVehicleId()));

		WorkShop workshop = workshopRepo.findById(dto.getWorkshopId())
				.orElseThrow(() -> new InfyCarServiceException("Workshop not found: " + dto.getWorkshopId()));

		List<CarService> services = serviceRepo.findAllById(dto.getServiceIds());
		if (services.isEmpty())
			throw new InfyCarServiceException("No valid services selected.");
		if (services.size() != dto.getServiceIds().size())
			throw new InfyCarServiceException("Invalid service IDs provided");

		LocalDateTime start = dto.getBookingTime();
		int totalDuration   = services.stream().mapToInt(CarService::getDurationMinutes).sum();
		LocalDateTime end   = start.plusMinutes(totalDuration);

		// Blackout check
		if (blackoutRepo.existsByWorkshopIdAndDate(dto.getWorkshopId(), start.toLocalDate())) {
			throw new InfyCarServiceException("Selected date is a blackout day — no bookings allowed.");
		}
		// Workshop hours check
		LocalTime workshopStart = workshop.getStartTime().toLocalTime();
		LocalTime workshopEnd   = workshop.getEndTime().toLocalTime();
		if (start.toLocalTime().isBefore(workshopStart) || end.toLocalTime().isAfter(workshopEnd))
			throw new InfyCarServiceException("Selected time is outside workshop hours.");

		// Vehicle conflict check
		if (bookingRepo.existsConflictingBooking(dto.getVehicleId(), start, end, -1L))
			throw new InfyCarServiceException("Vehicle already booked for this time slot.");

		// Capacity check: min(bays, active technicians, slotCapacityRule)
		int capacity = resolveCapacity(dto.getWorkshopId(), start.toLocalTime());
		int existing = bookingRepo.countBookingsInTimeRange(dto.getWorkshopId(), start, end);
		if (existing >= capacity)
			throw new InfyCarServiceException("This slot is fully booked.");

		Booking booking = new Booking();
		booking.setWorkshop(workshop);
		booking.setCustomer(customer);
		booking.setVehicle(vehicle);
		booking.setBookingTime(start);
		booking.setEndTime(end);
		booking.setStatus(BookingStatus.CONFIRMED);
		booking.setPickupRequired(dto.getPickupRequired());

		Booking saved = bookingRepo.save(booking);
		
		if(dto.getPickupRequired() !=null && dto.getPickupRequired()) {
        	if(dto.getPickupAddressId()==null) {
        		throw new InfyCarServiceException("Pickup address is required");
        	}
        	if(dto.getPickupTime()==null) {
        		throw new InfyCarServiceException("Pickup time is required");
        	}
        	if(dto.getDropTime()==null) {
        		throw new InfyCarServiceException("Drop time is required");
        	}
        	
        	PickupRequest pickup = new PickupRequest();
        	pickup.setBookingId(saved.getId());
        	pickup.setAddressId(dto.getPickupAddressId());
        	pickup.setStatus(PickupStatus.REQUESTED);
        	pickup.setType("PICKUP");
        	pickup.setScheduledTime(dto.getPickupTime());
        	
        	pickupRequestRepository.save(pickup);
        	
        	PickupRequest drop=new PickupRequest();
        	drop.setBookingId(saved.getId());
        	drop.setAddressId(dto.getDropAddressId());
        	drop.setStatus(PickupStatus.REQUESTED);
        	drop.setType("DROP");
        	drop.setScheduledTime(dto.getDropTime());
        	
        	pickupRequestRepository.save(drop);
        }

		workOrderService.createWorkOrder(saved.getId());
		return mapToDTO(saved, services);
	}

	/**
	 * Effective capacity = MIN(
	 *   bays in workshop,
	 *   technicians on shift at that time,
	 *   slot capacity rule max (if configured, else Integer.MAX_VALUE)
	 * )
	 */
	private int resolveCapacity(Long workshopId, LocalTime startTime) {
		int physicalCapacity = capacityEngine.getCapacity(workshopId, startTime);

		List<SlotCapacityRule> rules = ruleRepo.findByWorkshopId(workshopId);
		rules.sort(Comparator.comparing(SlotCapacityRule::getStartTime));

		int ruleCapacity = Integer.MAX_VALUE;
		for (SlotCapacityRule rule : rules) {
			if (!startTime.isBefore(rule.getStartTime()) && startTime.isBefore(rule.getEndTime())) {
				ruleCapacity = rule.getMaxCapacity();
				break;
			}
		}

		// If no bays or technicians configured yet, fall back to rule only (or 5)
		if (physicalCapacity == 0) {
			return ruleCapacity == Integer.MAX_VALUE ? 5 : ruleCapacity;
		}
		return ruleCapacity == Integer.MAX_VALUE ? physicalCapacity : Math.min(physicalCapacity, ruleCapacity);
	}

	public List<SlotDTO> getAvailableSlots(Long workshopId, Long serviceId, String date) {
		List<Long> serviceIds = new ArrayList<>();
		if (serviceId != null) {
			serviceIds.add(serviceId);
		}
		return getAvailableSlots(workshopId, serviceIds, date);
	}

	public List<SlotDTO> getAvailableSlots(Long workshopId, List<Long> serviceIds, String date) {

		LocalDate localDate = LocalDate.parse(date);

		// Blackout check
		if (blackoutRepo.existsByWorkshopIdAndDate(workshopId, localDate))
			return new ArrayList<>();

		WorkShop workshop = workshopRepo.findById(workshopId)
				.orElseThrow(() -> new InfyCarServiceException("Workshop not found"));

		if (serviceIds == null || serviceIds.isEmpty()) {
			throw new InfyCarServiceException("Select at least one service to load slots.");
		}

		List<CarService> services = serviceRepo.findAllById(serviceIds);
		if (services.isEmpty() || services.size() != serviceIds.size()) {
			throw new InfyCarServiceException("Service not found");
		}

		int duration      = services.stream()
				.mapToInt(service -> safeMinutes(service.getDurationMinutes()) + safeMinutes(service.getBufferMinutes()))
				.sum();
		if (duration <= 0) {
			duration = 30;
		}
		LocalTime open    = workshop.getStartTime().toLocalTime();
		LocalTime close   = workshop.getEndTime().toLocalTime();
		int stepMinutes   = 30; // booking step/buffer

		List<SlotDTO> slots    = new ArrayList<>();
		LocalDateTime slotStart = LocalDateTime.of(localDate, open);

		while (!slotStart.plusMinutes(duration).isAfter(LocalDateTime.of(localDate, close))) {
			LocalDateTime slotEnd = slotStart.plusMinutes(duration);

			int capacity = resolveCapacity(workshopId, slotStart.toLocalTime());
			int count    = bookingRepo.countBookingsInTimeRange(workshopId, slotStart, slotEnd);

			if (count < capacity) {
				slots.add(new SlotDTO(slotStart, slotEnd, capacity, count, capacity - count));
			}
			slotStart = slotStart.plusMinutes(stepMinutes);
		}
		return slots;
	}

	private int safeMinutes(Integer value) {
		return value == null ? 0 : value;
	}

	public List<BookingResponseDTO> getBookingsByCustomer(Long userId) {
		Customer customer = customerRepo.findByUserId(userId);
		if (customer == null)
			throw new InfyCarServiceException("Customer not found for userId: " + userId);
		return bookingRepo.findByCustomerId(customer.getId())
				.stream().map(b -> mapToDTO(b, b.getServices())).collect(Collectors.toList());
	}

	public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {
		Booking booking = bookingRepo.findById(bookingId)
				.orElseThrow(() -> new InfyCarServiceException("Booking not found: " + bookingId));
		Customer customer = customerRepo.findByUserId(userId);
		if (customer == null || !booking.getCustomer().getId().equals(customer.getId()))
			throw new InfyCarServiceException("Not authorized to cancel this booking.");
		if (booking.getStatus() == BookingStatus.CANCELLED)
			throw new InfyCarServiceException("Already cancelled.");
		if (booking.getStatus() == BookingStatus.COMPLETED)
			throw new InfyCarServiceException("Cannot cancel a completed booking.");
		booking.setStatus(BookingStatus.CANCELLED);
		Booking saved = bookingRepo.save(booking);
		        
        List<PickupRequest> requests = pickupRequestRepository.findByBookingId(bookingId);
        for(PickupRequest req: requests) {
        	req.setStatus(PickupStatus.DELIVERED);
        }
        pickupRequestRepository.saveAll(requests);
		return mapToDTO(saved, saved.getServices());
	}

	public List<BookingResponseDTO> getBookingsByWorkshop(Long workshopId) {
		return bookingRepo.findByWorkshopId(workshopId)
				.stream().map(b -> mapToDTO(b, b.getServices())).collect(Collectors.toList());
	}

	private BookingResponseDTO mapToDTO(Booking b, List<CarService> services) {
		BookingResponseDTO dto = new BookingResponseDTO();
		dto.setId(b.getId());
		dto.setStatus(b.getStatus() != null ? b.getStatus().name() : null);
		dto.setBookingTime(b.getBookingTime());
		dto.setEndTime(b.getEndTime());
		dto.setPickupRequired(b.getPickupRequired());
		dto.setReferenceNumber(generateReferenceNumber(b.getId()));
		if (b.getWorkshop() != null) {
			dto.setWorkshopId(b.getWorkshop().getId());
			dto.setWorkshopName(b.getWorkshop().getName());
		}
		if (b.getVehicle() != null) {
			dto.setVehicleId(b.getVehicle().getVehicleId());
			dto.setVehicleMake(b.getVehicle().getMake());
			dto.setVehicleModel(b.getVehicle().getModel());
			dto.setVehiclePlateNumber(b.getVehicle().getPlateNumber());
		}
		if (services != null) {
			dto.setServiceNames(services.stream().map(CarService::getName).collect(Collectors.toList()));
		}
		List<PickupRequest> requests = pickupRequestRepository.findByBookingId(b.getId());
        for(PickupRequest req: requests) {
        	if("PICKUP".equalsIgnoreCase(req.getType())) {
        		dto.setPickupTime(req.getScheduledTime());
        		dto.setPickupStatus(req.getStatus().name());
        	} else if ("DROP".equalsIgnoreCase(req.getType())) {
        		dto.setDropTime(req.getScheduledTime());
        		dto.setDropStatus(req.getStatus().name());
        	}
        }
		return dto;
	}
	private String generateReferenceNumber(Long id) {
    	String datePart = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
    	String idPart = String.format("%06d", id);
    	return "BOOK-"+datePart+"-"+idPart;
    }
	public void updatePickupStatus(Long requestId, String status) {
    	PickupRequest request = pickupRequestRepository.findById(requestId).orElseThrow(()->new InfyCarServiceException("Pickup request not found"));
    	try {
    		PickupStatus newStatus = PickupStatus.valueOf(status.toUpperCase());
    		request.setStatus(newStatus);
    	} catch (IllegalArgumentException e) {
    		throw new InfyCarServiceException("Invalid status value");
    	}
    	
    	pickupRequestRepository.save(request);
    }
	
	 @Transactional
	 public BookingResponseDTO rescheduleBooking(Long bookingId, Long userId, LocalDateTime newTime) {
	    	Booking booking = bookingRepo.findById(bookingId)
	    		    .orElseThrow(() -> new InfyCarServiceException("Booking not found: " + bookingId));

	    		Customer customer = customerRepo.findByUserId(userId);

	    		if (customer == null || !booking.getCustomer().getId().equals(customer.getId())) {
	    		    throw new InfyCarServiceException("Not authorized to reschedule this booking.");
	    		}

	    		if (booking.getStatus() == BookingStatus.CANCELLED) {
	    		    throw new InfyCarServiceException("Cannot reschedule a cancelled booking.");
	    		}

	    		if (booking.getStatus() == BookingStatus.COMPLETED) {
	    		    throw new InfyCarServiceException("Cannot reschedule a completed booking.");
	    		}

	    		WorkShop workshop = booking.getWorkshop();
	    		List<CarService> services = booking.getServices();

	    		int totalDuration = services.stream()
	    		    .mapToInt(CarService::getDurationMinutes)
	    		    .sum();

	    		LocalDateTime newEnd = newTime.plusMinutes(totalDuration);

	    		LocalTime workshopStart = workshop.getStartTime().toLocalTime();
	    		LocalTime workshopEnd = workshop.getEndTime().toLocalTime();

	    		if (newTime.toLocalTime().isBefore(workshopStart) ||
	    		    newEnd.toLocalTime().isAfter(workshopEnd)) {

	    		    throw new InfyCarServiceException("Selected time is outside workshop hours");
	    		}

	    		List<SlotDTO> validSlots = getAvailableSlots(
	    		    workshop.getId(),
	    		    services.get(0).getId(),
	    		    newTime.toLocalDate().toString()
	    		);

	    		boolean isValidSlot = validSlots.stream()
	    		    .anyMatch(slot ->
	    		        slot.getStartTime().isEqual(newTime)
	    		    );

	    		if (!isValidSlot) {
	    		    throw new InfyCarServiceException("Invalid or unavailable slot selected");
	    		}

	    		boolean conflict = bookingRepo.existsConflictingBooking(
	    		    booking.getVehicle().getVehicleId(),
	    		    newTime,
	    		    newEnd,
	    		    bookingId
	    		);

	    		if (conflict) {
	    		    throw new InfyCarServiceException("Vehicle already booked for this time slot");
	    		}

	    		int existingBookings = bookingRepo.countBookingsInTimeRange(
	    		    workshop.getId(),
	    		    newTime,
	    		    newEnd
	    		);

	    		int maxCapacity = resolveCapacity(
	    		    workshop.getId(),
	    		    newTime.toLocalTime()
	    		);

	    		if (existingBookings >= maxCapacity) {
	    		    throw new InfyCarServiceException("This slot is fully booked.");
	    		}

	    		booking.setBookingTime(newTime);
	    		booking.setEndTime(newEnd);
	    		Booking saved = bookingRepo.save(booking);
	    		return mapToDTO(saved, services);
	    }
	 
	 /**
	 * US 11 — Customer views pickup/drop status for their booking
	 * GET /customer/bookings/{bookingId}/pickup
	 */
	 public List<PickupStatusDTO> getPickupsByBooking(Long bookingId, Long userId) {
	 Booking booking = bookingRepo.findById(bookingId)
	 .orElseThrow(() -> new InfyCarServiceException("Booking not found: " + bookingId));
	 Customer customer = customerRepo.findByUserId(userId);
	 if (customer == null || !booking.getCustomer().getId().equals(customer.getId()))
	 throw new InfyCarServiceException("Not authorized to view this booking.");
	 return pickupRequestRepository.findByBookingId(bookingId)
	 .stream()
	 .map(this::mapToPickupDTO)
	 .collect(Collectors.toList());
	 }

	 /**
	  * US 11 — Customer cancels a pickup/drop request (only if status = REQUESTED)
	  * PUT /customer/bookings/pickup/{pickupId}/cancel
	  */
	 @Transactional
	 public PickupStatusDTO cancelPickupRequest(Long pickupId, Long userId) {
	     PickupRequest pickup = pickupRequestRepository.findById(pickupId)
	         .orElseThrow(() -> new InfyCarServiceException("Pickup request not found: " + pickupId));
	     Booking booking = bookingRepo.findById(pickup.getBookingId())
	         .orElseThrow(() -> new InfyCarServiceException("Booking not found."));
	     Customer customer = customerRepo.findByUserId(userId);
	     if (customer == null || !booking.getCustomer().getId().equals(customer.getId()))
	         throw new InfyCarServiceException("Not authorized to cancel this pickup request.");
	     if (pickup.getStatus() != PickupStatus.REQUESTED)
	         throw new InfyCarServiceException(
	             "Cannot cancel pickup in status: " + pickup.getStatus());
	     pickup.setStatus(PickupStatus.CANCELLED); // reuse DELIVERED as cancelled marker, or add CANCELLED to enum
	     PickupRequest saved = pickupRequestRepository.save(pickup);
	     return mapToPickupDTO(saved);
	 }

	 private PickupStatusDTO mapToPickupDTO(PickupRequest p) {
	     PickupStatusDTO dto = new PickupStatusDTO();
	     dto.setId(p.getId());
	     dto.setBookingId(p.getBookingId());
	     dto.setType(p.getType());
	     dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
	     dto.setAddressId(p.getAddressId());
	     dto.setScheduledTime(p.getScheduledTime());
	     dto.setCompletedTime(p.getCompletedTime());
	     return dto;
	 }
	 

}

