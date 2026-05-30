package com.infy.carservice.common.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.auth.entity.User;
import com.infy.carservice.auth.repository.AuthRepository;
import com.infy.carservice.common.entity.Manager;
import com.infy.carservice.common.entity.Technician;
import com.infy.carservice.common.enums.UserStatus;
import com.infy.carservice.common.enums.UserType;
import com.infy.carservice.common.repository.AuditLogRepository;
import com.infy.carservice.common.repository.ManagerRepository;
import com.infy.carservice.common.repository.NotificationLogRepository;
import com.infy.carservice.common.repository.TechnicianRepository;
import com.infy.carservice.customer.entity.Customer;
import com.infy.carservice.customer.repository.CustomerRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AdminService {

    @Autowired
    private AuthRepository authRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationLogService notificationLogService;

    public List<Map<String, Object>> getUsers(String role, String status) {
        return authRepository.findAll().stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .filter(user -> role == null || role.isBlank() || user.getUserType().name().equalsIgnoreCase(role))
            .filter(user -> status == null || status.isBlank() || user.getStatus().name().equalsIgnoreCase(status))
            .map(this::toUserMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> updateUserStatus(Long targetUserId, String status, Long actorUserId) {
        User user = authRepository.findById(targetUserId)
            .orElseThrow(() -> new RuntimeException("User not found: " + targetUserId));
        UserStatus nextStatus = UserStatus.valueOf(status.toUpperCase());
        user.setStatus(nextStatus);
        User saved = authRepository.save(user);
        auditLogService.log(actorUserId, "USER_STATUS_UPDATED", "USER", saved.getId(), "SYSTEM");
        notificationLogService.notifyUser(
            saved.getId(),
            "ACCOUNT_STATUS",
            "Your account status was updated to " + saved.getStatus().name() + "."
        );
        return toUserMap(saved);
    }

    public Map<String, Object> getAdminSummary() {
        List<User> users = authRepository.findAll();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", users.size());
        summary.put("activeUsers", users.stream().filter(user -> user.getStatus() == UserStatus.ACTIVE).count());
        summary.put("lockedUsers", users.stream().filter(user -> user.getStatus() == UserStatus.LOCKED).count());
        summary.put("customerUsers", users.stream().filter(user -> user.getUserType() == UserType.CUSTOMER).count());
        summary.put("managerUsers", users.stream().filter(user -> user.getUserType() == UserType.MANAGER).count());
        summary.put("technicianUsers", users.stream().filter(user -> user.getUserType() == UserType.TECHNICIAN).count());
        summary.put("notificationCount", notificationLogRepository.count());
        summary.put("auditLogCount", auditLogRepository.count());
        return summary;
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("userType", user.getUserType().name());
        map.put("status", user.getStatus().name());
        map.put("createdAt", user.getCreatedAt());
        map.put("displayName", resolveDisplayName(user));
        return map;
    }

    private String resolveDisplayName(User user) {
        if (user.getUserType() == UserType.CUSTOMER) {
            Customer customer = customerRepository.findByUserId(user.getId());
            return customer != null && customer.getFullName() != null && !customer.getFullName().isBlank()
                ? customer.getFullName()
                : user.getEmail();
        }
        if (user.getUserType() == UserType.MANAGER) {
            Manager manager = managerRepository.findByUserId(user.getId());
            return manager != null && manager.getFullName() != null && !manager.getFullName().isBlank()
                ? manager.getFullName()
                : user.getEmail();
        }
        if (user.getUserType() == UserType.TECHNICIAN) {
            Technician technician = technicianRepository.findByUserId(user.getId());
            return technician != null && technician.getTechnicianName() != null && !technician.getTechnicianName().isBlank()
                ? technician.getTechnicianName()
                : user.getEmail();
        }
        return "System Admin";
    }
}
