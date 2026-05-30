
package com.infy.carservice.scheduling.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.scheduling.dto.BookingResponseDTO;

import com.infy.carservice.scheduling.dto.CreateBookingDTO;
import com.infy.carservice.scheduling.dto.PickupStatusDTO;
import com.infy.carservice.scheduling.service.BookingService;

import jakarta.validation.Valid;

@RestController

@RequestMapping("/customer/bookings")

public class BookingController {

    @Autowired

    private BookingService bookingService;

    @PostMapping("/book")

    public ResponseEntity<BookingResponseDTO> createBooking(

            @Valid @RequestBody CreateBookingDTO dto) {

        return ResponseEntity.ok(bookingService.createBooking(dto));

    }


    @GetMapping

    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(

            @RequestParam Long userId) {

        return ResponseEntity.ok(bookingService.getBookingsByCustomer(userId));

    }


    @PutMapping("/{bookingId}/cancel")

    public ResponseEntity<BookingResponseDTO> cancelBooking(

            @PathVariable Long bookingId,

            @RequestParam Long userId) {

        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, userId));

    }
    
    @PutMapping("/{bookingId}/reschedule")
    public ResponseEntity<BookingResponseDTO> rescheduleBooking(
    		@PathVariable Long bookingId,
    		@RequestParam Long userId,
    		@RequestParam LocalDateTime newTime){
    	return ResponseEntity.ok(bookingService.rescheduleBooking(bookingId, userId, newTime));
    }


    @GetMapping("/workshop/{workshopId}")

    public ResponseEntity<List<BookingResponseDTO>> getWorkshopBookings(

            @PathVariable Long workshopId) {

        return ResponseEntity.ok(bookingService.getBookingsByWorkshop(workshopId));

    }
    /**
    * US 11 - Get pickup/drop status for a booking
    * GET /customer/bookings/{bookingId}/pickup?userId=1
    */
    @GetMapping("/{bookingId}/pickup")
    public ResponseEntity<List<PickupStatusDTO>> getPickupStatus(
    @PathVariable Long bookingId,
    @RequestParam Long userId) {
    return ResponseEntity.ok(bookingService.getPickupsByBooking(bookingId, userId));
    }

    /**
     * US 11 - Cancel a pickup/drop request (only if REQUESTED)
     * PUT /customer/bookings/pickup/{pickupId}/cancel?userId=1
     */
    @PutMapping("/pickup/{pickupId}/cancel")
    public ResponseEntity<PickupStatusDTO> cancelPickup(
            @PathVariable Long pickupId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(bookingService.cancelPickupRequest(pickupId, userId));
    }

}



























































































































































































































































