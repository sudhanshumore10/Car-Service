package com.infy.carservice.common.service;

import java.util.List;

import java.util.Map;

import java.util.LinkedHashMap;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.WorkOrder;

import com.infy.carservice.common.repository.WorkOrderRepository;

import com.infy.carservice.scheduling.repository.BookingRepository;

import com.infy.carservice.workshop.repository.WorkshopRepository;

import jakarta.persistence.EntityManager;

import jakarta.persistence.PersistenceContext;

@Service

public class ReportService {

    @Autowired

    private BookingRepository bookingRepository;

    @Autowired

    private WorkOrderRepository workOrderRepository;

    @Autowired

    private WorkshopRepository workshopRepository;

    @PersistenceContext

    private EntityManager entityManager;

    public Map<String, Object> getDashboardSummary() {

        long totalBookings = bookingRepository.count();

        long confirmed = bookingRepository.findAll().stream()

            .filter(b -> "CONFIRMED".equals(

                b.getStatus() != null ? b.getStatus().name() : ""))

            .count();

        long completed = bookingRepository.findAll().stream()

            .filter(b -> "COMPLETED".equals(

                b.getStatus() != null ? b.getStatus().name() : ""))

            .count();

        long cancelled = bookingRepository.findAll().stream()

            .filter(b -> "CANCELLED".equals(

                b.getStatus() != null ? b.getStatus().name() : ""))

            .count();

        long activeWorkOrders = workOrderRepository.findAll().stream()

            .filter(wo -> !"CLOSED".equals(wo.getStatus())

                && !"DELIVERED".equals(wo.getStatus()))

            .count();

        Object revenueResult = entityManager

            .createNativeQuery(

                "SELECT COALESCE(SUM(total_amount), 0) " +

                "FROM invoices WHERE status = 'PAID'")

            .getSingleResult();

        double revenue = revenueResult != null ?

            ((Number) revenueResult).doubleValue() : 0.0;

        long totalWorkshops = workshopRepository.count();

        Map<String, Object> summary = new LinkedHashMap<>();

        summary.put("totalBookings", totalBookings);

        summary.put("confirmedBookings", confirmed);

        summary.put("completedBookings", completed);

        summary.put("cancelledBookings", cancelled);

        summary.put("activeWorkOrders", activeWorkOrders);

        summary.put("totalRevenue", revenue);

        summary.put("totalWorkshops", totalWorkshops);

        return summary;

    }

    @SuppressWarnings("unchecked")

    public List<Map<String, Object>> getTopServices() {

        List<Object[]> results = entityManager.createNativeQuery(

            "SELECT s.name, COUNT(bs.booking_id) as booking_count " +

            "FROM services s " +

            "JOIN booking_services bs ON s.id = bs.service_id " +

            "GROUP BY s.id, s.name " +

            "ORDER BY booking_count DESC " +

            "LIMIT 10")

            .getResultList();

        return results.stream().map(row -> {

            Map<String, Object> map = new LinkedHashMap<>();

            map.put("serviceName", row[0]);

            map.put("bookingCount", ((Number) row[1]).longValue());

            return map;

        }).collect(Collectors.toList());

    }

    public List<Map<String, Object>> getTechnicianProductivity() {

        return workOrderRepository.findAll().stream()

            .filter(wo -> wo.getAssignedTechnician() != null

                && ("DELIVERED".equals(wo.getStatus())

                    || "CLOSED".equals(wo.getStatus())))

            .collect(Collectors.groupingBy(

                wo -> wo.getAssignedTechnician().getTechnicianId(),

                Collectors.counting()))

            .entrySet().stream()

            .map(entry -> {

                String name = workOrderRepository.findAll().stream()

                    .filter(wo -> wo.getAssignedTechnician() != null

                        && wo.getAssignedTechnician()

                            .getTechnicianId().equals(entry.getKey()))

                    .findFirst()

                    .map(wo -> wo.getAssignedTechnician()

                        .getTechnicianName())

                    .orElse("Unknown");

                Map<String, Object> map = new LinkedHashMap<>();

                map.put("technicianId", entry.getKey());

                map.put("technicianName", name);

                map.put("jobsCompleted", entry.getValue());

                return map;

            })

            .collect(Collectors.toList());

    }

    public Map<String, Long> getWorkOrderStatusDistribution() {

        return workOrderRepository.findAll().stream()

            .collect(Collectors.groupingBy(

                wo -> wo.getStatus() != null ? wo.getStatus() : "UNKNOWN",

                Collectors.counting()));

    }

    @SuppressWarnings("unchecked")

    public List<Map<String, Object>> getRevenueByWorkshop() {

        List<Object[]> results = entityManager.createNativeQuery(

            "SELECT w.name, COALESCE(SUM(i.total_amount), 0) as revenue " +

            "FROM workshops w " +

            "LEFT JOIN bookings b ON b.workshop_id = w.id " +

            "LEFT JOIN work_orders wo ON wo.booking_id = b.id " +

            "LEFT JOIN invoices i ON i.work_order_id = wo.id " +

            "AND i.status = 'PAID' " +

            "GROUP BY w.id, w.name " +

            "ORDER BY revenue DESC")

            .getResultList();

        return results.stream().map(row -> {

            Map<String, Object> map = new LinkedHashMap<>();

            map.put("workshopName", row[0]);

            map.put("revenue", ((Number) row[1]).doubleValue());

            return map;

        }).collect(Collectors.toList());

    }

    @SuppressWarnings("unchecked")

    public List<Map<String, Object>> getPartsUsage() {

        List<Object[]> results = entityManager.createNativeQuery(

            "SELECT p.name, COALESCE(SUM(wop.quantity), 0) AS quantity_used, " +

            "COALESCE(SUM(wop.quantity * p.price), 0) AS spend " +

            "FROM parts p " +

            "LEFT JOIN work_order_parts wop ON wop.part_id = p.id " +

            "GROUP BY p.id, p.name " +

            "ORDER BY quantity_used DESC " +

            "LIMIT 10")

            .getResultList();

        return results.stream().map(row -> {

            Map<String, Object> map = new LinkedHashMap<>();

            map.put("partName", row[0]);

            map.put("quantityUsed", ((Number) row[1]).longValue());

            map.put("spend", ((Number) row[2]).doubleValue());

            return map;

        }).collect(Collectors.toList());

    }

    @SuppressWarnings("unchecked")

    public List<Map<String, Object>> getBookingVolume() {

        List<Object[]> results = entityManager.createNativeQuery(

            "SELECT DATE(booking_time) AS booking_date, COUNT(id) AS booking_count " +

            "FROM bookings " +

            "GROUP BY DATE(booking_time) " +

            "ORDER BY booking_date DESC " +

            "LIMIT 14")

            .getResultList();

        return results.stream().map(row -> {

            Map<String, Object> map = new LinkedHashMap<>();

            map.put("bookingDate", String.valueOf(row[0]));

            map.put("bookingCount", ((Number) row[1]).longValue());

            return map;

        }).collect(Collectors.toList());

    }

}
