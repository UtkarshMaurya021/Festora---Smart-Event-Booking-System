package com.festora.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import com.festora.entity.Venue;
import com.festora.service.VenueService;

@RestController
@CrossOrigin("*")
public class VenueController {

    private final VenueService service;

    public VenueController(VenueService service) {
        this.service = service;
    }

    @GetMapping("/api/venues")
    public List<Venue> getAll() {
        return service.getAll();
    }

    @PostMapping("/api/admin/venues")
    public Venue save(@Valid @RequestBody Venue venue) {
        return service.save(venue);
    }

    @PutMapping("/api/admin/venues/{id}")
    public Venue update(@PathVariable Long id, @Valid @RequestBody Venue venue) {
        return service.update(id, venue);
    }

    @DeleteMapping("/api/admin/venues/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}