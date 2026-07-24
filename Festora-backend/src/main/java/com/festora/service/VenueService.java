package com.festora.service;

import com.festora.entity.Venue;
import com.festora.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository repository;

    public VenueService(VenueRepository repository) {
        this.repository = repository;
    }

    public List<Venue> getAll() {

        return repository.findAll();

    }

    public Venue create(Venue venue) {

        return repository.save(venue);

    }

    public Venue update(Long id, Venue venue) {

        Venue db = repository.findById(id).orElseThrow();

        db.setVenueName(venue.getVenueName());
        db.setAddress(venue.getAddress());
        db.setCity(venue.getCity());
        db.setState(venue.getState());
        db.setPostalCode(venue.getPostalCode());
        db.setCapacity(venue.getCapacity());

        return repository.save(db);

    }

    public void delete(Long id) {

        repository.deleteById(id);

    }

}