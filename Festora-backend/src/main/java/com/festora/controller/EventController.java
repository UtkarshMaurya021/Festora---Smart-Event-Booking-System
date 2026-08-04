package com.festora.controller;

import com.festora.entity.Event;
import com.festora.repository.EventRepository;
import com.festora.service.BookingService;
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
    private final BookingService bookingService;

    public EventController(EventRepository repository, EventService service, BookingService bookingService) {
        this.repository = repository;
        this.service = service;
        this.bookingService = bookingService;
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Long id) {
        return service.getEvent(id);
    }

    @GetMapping("/{id}/booked-seats")
    public List<String> getBookedSeats(@PathVariable Long id) {
        return bookingService.getBookedSeatsForEvent(id);
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
