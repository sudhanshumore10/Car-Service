
package com.infy.carservice.scheduling.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.infy.carservice.scheduling.entity.Booking;


public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Count bookings in a time range for capacity check (excludes cancelled)

	@Query("SELECT count(b) FROM Booking b WHERE b.workshop.id = :workshopId AND b.status != 'CANCELLED' AND b.bookingTime < :endTime AND b.endTime > :startTime")

    int countBookingsInTimeRange(

            @Param("workshopId") Long workshopId,

            @Param("startTime") LocalDateTime startTime,

            @Param("endTime") LocalDateTime endTime);

    // All bookings for a customer (by customer table ID)

    List<Booking> findByCustomerId(Long customerId);

    // All bookings for a workshop (for manager view)

    List<Booking> findByWorkshopId(Long workshopId);
    
    @Query("""
    		SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
    		FROM Booking b
    		WHERE b.vehicle.vehicleId = :vehicleId
    		AND b.status != 'CANCELLED'
    		AND b.bookingTime < :end
    		AND b.endTime > :start
    		""")
    		boolean existsConflictingBooking(
    		@Param("vehicleId") Long vehicleId,
    		@Param("start") LocalDateTime start,
    		@Param("end") LocalDateTime end,
    		@Param("bookingId") Long bookingId
    		);
    
    List<Booking> findByWorkshopIdAndBookingTimeBetween(
    		Long workshopId,
    		LocalDateTime start,
    		LocalDateTime end);

}
