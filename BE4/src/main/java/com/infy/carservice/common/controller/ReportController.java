package com.infy.carservice.common.controller;

import java.util.List;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import com.infy.carservice.common.service.ReportService;

@RestController

@RequestMapping("/manager/reports")

public class ReportController {

    @Autowired

    private ReportService reportService;

    @GetMapping("/summary")

    public ResponseEntity<?> getSummary() {

        return ResponseEntity.ok(reportService.getDashboardSummary());

    }

    @GetMapping("/top-services")

    public ResponseEntity<?> getTopServices() {

        return ResponseEntity.ok(reportService.getTopServices());

    }

    @GetMapping("/technician-productivity")

    public ResponseEntity<?> getTechnicianProductivity() {

        return ResponseEntity.ok(reportService.getTechnicianProductivity());

    }

    @GetMapping("/work-order-status")

    public ResponseEntity<?> getWorkOrderStatus() {

        return ResponseEntity.ok(reportService.getWorkOrderStatusDistribution());

    }

    @GetMapping("/revenue-by-workshop")

    public ResponseEntity<?> getRevenueByWorkshop() {

        return ResponseEntity.ok(reportService.getRevenueByWorkshop());

    }

    @GetMapping("/parts-usage")

    public ResponseEntity<?> getPartsUsage() {

        return ResponseEntity.ok(reportService.getPartsUsage());

    }

    @GetMapping("/booking-volume")

    public ResponseEntity<?> getBookingVolume() {

        return ResponseEntity.ok(reportService.getBookingVolume());

    }

}
