package com.festora.controller;

import com.festora.entity.Event;
import com.festora.repository.EventRepository;
import com.festora.service.EventService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/events")
@CrossOrigin("*")
public class EventController {

    private final EventRepository repository;
    private final EventService service;   

    // Constructor injection
    public EventController(EventRepository repository, EventService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return service.getEvent(id);
    }
    @GetMapping
    public List<Event> getAllEvents() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("User is not authenticated");
        }

        service.deleteEvent(id, authentication.getName());  
        return ResponseEntity.ok("Event deleted successfully");
    }
}
