package com.infy.carservice.feedback.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.common.entity.WorkOrder;
import com.infy.carservice.common.repository.WorkOrderRepository;
import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;
import com.infy.carservice.feedback.dto.FeedbackEligibleDTO;
import com.infy.carservice.feedback.dto.FeedbackManagerResponseDTO;
import com.infy.carservice.feedback.dto.FeedbackRequestDTO;
import com.infy.carservice.feedback.dto.FeedbackResponseDTO;
import com.infy.carservice.feedback.entity.Feedback;
import com.infy.carservice.feedback.repository.FeedbackRepository;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    public List<FeedbackEligibleDTO> getEligibleWorkOrders(Long userId) {
        Customer customer = customerRepository.findByUserId(userId);
        if (customer == null) {
            throw new RuntimeException("Customer not found");
        }

        return workOrderRepository.findAll().stream()
                .filter(workOrder -> workOrder.getBooking() != null
                        && workOrder.getBooking().getCustomer() != null
                        && customer.getId().equals(workOrder.getBooking().getCustomer().getId()))
                .filter(workOrder -> "CLOSED".equalsIgnoreCase(workOrder.getStatus())
                        || "DELIVERED".equalsIgnoreCase(workOrder.getStatus()))
                .filter(workOrder -> feedbackRepository.findByWorkOrderId(workOrder.getId()).isEmpty())
                .map(this::toEligibleDto)
                .toList();
    }

    public List<FeedbackResponseDTO> getCustomerFeedback(Long userId) {
        Customer customer = customerRepository.findByUserId(userId);
        if (customer == null) {
            throw new RuntimeException("Customer not found");
        }

        return feedbackRepository.findByWorkOrderBookingCustomerId(customer.getId()).stream()
                .map(this::toResponseDto)
                .toList();
    }

    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request) {
        Customer customer = customerRepository.findByUserId(request.getUserId());
        if (customer == null) {
            throw new RuntimeException("Customer not found");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        WorkOrder workOrder = workOrderRepository.findById(request.getWorkOrderId())
                .orElseThrow(() -> new RuntimeException("Work order not found"));

        if (workOrder.getBooking() == null
                || workOrder.getBooking().getCustomer() == null
                || !customer.getId().equals(workOrder.getBooking().getCustomer().getId())) {
            throw new RuntimeException("Not authorized to submit feedback for this work order");
        }

        if (!"CLOSED".equalsIgnoreCase(workOrder.getStatus())
                && !"DELIVERED".equalsIgnoreCase(workOrder.getStatus())) {
            throw new RuntimeException("Feedback is allowed only after service completion");
        }

        if (feedbackRepository.findByWorkOrderId(workOrder.getId()).isPresent()) {
            throw new RuntimeException("Feedback already submitted for this work order");
        }

        Feedback feedback = new Feedback();
        feedback.setWorkOrder(workOrder);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());
        feedback.setTags(request.getTags());
        feedback.setSubmittedAt(LocalDateTime.now());

        return toResponseDto(feedbackRepository.save(feedback));
    }

    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::toResponseDto)
                .toList();
    }

    public FeedbackResponseDTO respondToFeedback(Long feedbackId, FeedbackManagerResponseDTO request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        feedback.setManagerResponse(request.getManagerResponse());
        feedback.setManagerRespondedAt(LocalDateTime.now());
        return toResponseDto(feedbackRepository.save(feedback));
    }

    private FeedbackEligibleDTO toEligibleDto(WorkOrder workOrder) {
        FeedbackEligibleDTO dto = new FeedbackEligibleDTO();
        dto.setWorkOrderId(workOrder.getId());
        dto.setBookingId(workOrder.getBooking() != null ? workOrder.getBooking().getId() : null);
        dto.setStatus(workOrder.getStatus());
        if (workOrder.getBooking() != null) {
            dto.setWorkshopName(workOrder.getBooking().getWorkshop() != null
                    ? workOrder.getBooking().getWorkshop().getName()
                    : null);
            dto.setVehicle(workOrder.getBooking().getVehicle() != null
                    ? workOrder.getBooking().getVehicle().getMake() + " "
                            + workOrder.getBooking().getVehicle().getModel()
                    : null);
        }
        return dto;
    }

    private FeedbackResponseDTO toResponseDto(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setRating(feedback.getRating());
        dto.setComments(feedback.getComments());
        dto.setTags(feedback.getTags());
        dto.setManagerResponse(feedback.getManagerResponse());
        dto.setSubmittedAt(feedback.getSubmittedAt());
        dto.setManagerRespondedAt(feedback.getManagerRespondedAt());
        if (feedback.getWorkOrder() != null) {
            dto.setWorkOrderId(feedback.getWorkOrder().getId());
            if (feedback.getWorkOrder().getBooking() != null) {
                dto.setBookingId(feedback.getWorkOrder().getBooking().getId());
                dto.setWorkshopName(feedback.getWorkOrder().getBooking().getWorkshop() != null
                        ? feedback.getWorkOrder().getBooking().getWorkshop().getName()
                        : null);
                dto.setVehicle(feedback.getWorkOrder().getBooking().getVehicle() != null
                        ? feedback.getWorkOrder().getBooking().getVehicle().getMake() + " "
                                + feedback.getWorkOrder().getBooking().getVehicle().getModel()
                        : null);
                dto.setCustomerName(feedback.getWorkOrder().getBooking().getCustomer() != null
                        ? feedback.getWorkOrder().getBooking().getCustomer().getFullName()
                        : null);
            }
        }
        return dto;
    }
}
