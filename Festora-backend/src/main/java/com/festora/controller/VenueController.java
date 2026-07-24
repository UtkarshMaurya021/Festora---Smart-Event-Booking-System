package com.festora.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.festora.entity.Venue;
import com.festora.repository.VenueRepository;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = "http://localhost:5173")
public class VenueController {

    private final VenueRepository venueRepository;

    public VenueController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @GetMapping
    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

}