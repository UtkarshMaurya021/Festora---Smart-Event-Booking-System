package com.festora.controller;

import java.util.List;
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

    // Accessible to all users for dropdown lists
    @GetMapping("/api/venues")
    public List<Venue> getAll() {
        return service.getAll();
    }

    // Administrative modification routes remain restricted
    @PostMapping("/api/admin/venues")
    public Venue save(@RequestBody Venue venue) {
        return service.save(venue);
    }

    @PutMapping("/api/admin/venues/{id}")
    public Venue update(@PathVariable Long id, @RequestBody Venue venue) {
        return service.update(id, venue);
    }

    @DeleteMapping("/api/admin/venues/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
