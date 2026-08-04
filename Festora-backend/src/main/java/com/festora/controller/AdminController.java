package com.festora.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.festora.dto.AdminDashboardResponse;
import com.festora.entity.Booking;
import com.festora.entity.EmailLog;
import com.festora.entity.Event;
import com.festora.entity.Payment;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.service.AdminService;
import com.festora.service.EmailService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;
    private final EmailService emailService;

    public AdminController(AdminService adminService, EmailService emailService) {
        this.adminService = adminService;
        this.emailService = emailService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/events")
    public List<Event> getEvents() {
        return adminService.getAllEvents();
    }

    @GetMapping("/bookings")
    public List<Booking> getBookings() {
        return adminService.getAllBookings();
    }

    @GetMapping("/payments")
    public List<Payment> getPayments() {
        return adminService.getAllPayments();
    }

    @GetMapping("/organizer-requests")
    public List<User> getOrganizerRequests() {
        return adminService.getPendingOrganizers();
    }

    @PutMapping("/organizer-requests/{id}/approve")
    public User approveOrganizer(@PathVariable Long id) {
        return adminService.approveOrganizer(id);
    }

    @PutMapping("/organizer-requests/{id}/reject")
    public User rejectOrganizer(@PathVariable Long id) {
        return adminService.rejectOrganizer(id);
    }

    @GetMapping("/pending-events")
    public List<Event> getPendingEvents() {
        return adminService.getPendingEvents();
    }

    @PutMapping("/events/{id}/approve")
    public Event approveEvent(@PathVariable Long id) {
        return adminService.approveEvent(id);
    }

    @PutMapping("/events/{id}/reject")
    public Event rejectEvent(@PathVariable Long id) {
        return adminService.rejectEvent(id);
    }

    @PutMapping("/events/{id}/status")
    public Event updateEventStatus(@PathVariable Long id, @RequestParam Status status) {
        return adminService.updateEventStatus(id, status);
    }

    @PutMapping("/users/{id}/block")
    public User blockUser(@PathVariable Long id) {
        return adminService.blockUser(id);
    }

    @PutMapping("/users/{id}/activate")
    public User activateUser(@PathVariable Long id) {
        return adminService.activateUser(id);
    }

    @DeleteMapping("/events/{id}")
    public void deleteEvent(@PathVariable Long id) {
        adminService.deleteEvent(id);
    }

    @GetMapping("/email-logs")
    public List<EmailLog> getEmailLogs() {
        return emailService.getAllEmailLogs();
    }
}