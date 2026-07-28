package com.festora.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.festora.entity.Event;
import com.festora.entity.User;
import com.festora.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/events")
    public List<Event> getEvents() {
        return adminService.getAllEvents();
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
}
