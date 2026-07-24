package com.festora.controller;

import com.festora.dto.EventRequest;
import com.festora.entity.Event;
import com.festora.service.EventService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizer")
@CrossOrigin("*")
public class OrganizerController {

    private final EventService eventService;

    public OrganizerController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/events")
    public Event createEvent(@RequestBody EventRequest request,
                             Authentication authentication) {
        return eventService.create(request, authentication.getName());
    }

    @GetMapping("/events")
    public List<Event> myEvents(Authentication authentication) {
        return eventService.getMyEvents(authentication.getName());
    }

    @GetMapping("/events/{id}")
    public Event getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @DeleteMapping("/events/{id}")
    public void deleteEvent(@PathVariable Long id,
                            Authentication authentication) {
        eventService.deleteEvent(id, authentication.getName());
    }

    @PutMapping("/events/{id}")
    public Event updateEvent(@PathVariable Long id,
                             @RequestBody EventRequest request,
                             Authentication authentication) {
        return eventService.updateEvent(id, request, authentication.getName());
    }
}
