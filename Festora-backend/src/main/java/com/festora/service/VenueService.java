package com.festora.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.festora.entity.Venue;
import com.festora.repository.VenueRepository;

@Service
public class VenueService {

    private final VenueRepository repository;

    public VenueService(VenueRepository repository) {
        this.repository = repository;
    }

    public List<Venue> getAll() {
        return repository.findAll();
    }

    public Venue save(Venue venue) {
        return repository.save(venue);
    }

    public Venue update(Long id, Venue venue) {

        Venue v = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        v.setVenueName(venue.getVenueName());
        v.setAddress(venue.getAddress());
        v.setCity(venue.getCity());
        v.setState(venue.getState());
        v.setPostalCode(venue.getPostalCode());
        v.setCapacity(venue.getCapacity());

        return repository.save(v);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}