package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.festora.dto.AdminDashboardResponse;
import com.festora.entity.Event;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.EventRepository;
import com.festora.repository.PaymentRepository;
import com.festora.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(UserRepository userRepository, EventRepository eventRepository,
            PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.paymentRepository = paymentRepository;
    }

    public AdminDashboardResponse getDashboard() {

        long users = userRepository.countByRole(Role.ROLE_USER);
        // Only count organizers who have actually been approved
        long organizers = userRepository.countByRoleAndStatus(Role.ROLE_ORGANIZER, Status.ACTIVE);
        long events = eventRepository.count();
        Double revenue = paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS);

        List<AdminDashboardResponse.OrganizerRequestSummary> organizerRequests = getPendingOrganizers()
                .stream()
                .map(u -> new AdminDashboardResponse.OrganizerRequestSummary(
                        u.getUserId(),
                        u.getName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getCreatedAt()))
                .collect(Collectors.toList());

        return new AdminDashboardResponse(
                users,
                organizers,
                events,
                revenue,
                organizerRequests);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<User> getPendingOrganizers() {
        return userRepository.findByRoleAndStatus(Role.ROLE_ORGANIZER, Status.PENDING);
    }

    public User approveOrganizer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizer request not found"));

        if (user.getRole() != Role.ROLE_ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }

        user.setStatus(Status.ACTIVE);
        return userRepository.save(user);
    }

    public User rejectOrganizer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizer request not found"));

        if (user.getRole() != Role.ROLE_ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }

        user.setStatus(Status.INACTIVE);
        return userRepository.save(user);
    }

    public User blockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(Status.INACTIVE);
        return userRepository.save(user);
    }

    public User activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(Status.ACTIVE);
        return userRepository.save(user);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(Status.INACTIVE);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }
}