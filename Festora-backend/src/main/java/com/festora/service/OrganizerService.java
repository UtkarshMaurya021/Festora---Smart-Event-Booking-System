package com.festora.service;

import com.festora.dto.EventRequest;
import com.festora.entity.*;
import com.festora.repository.*;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrganizerService {

    private final EventRepository eventRepository;
    private final OrganizerRepository organizerRepository;
    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;

    public OrganizerService(
            EventRepository eventRepository,
            OrganizerRepository organizerRepository,
            CategoryRepository categoryRepository,
            VenueRepository venueRepository){

        this.eventRepository = eventRepository;
        this.organizerRepository = organizerRepository;
        this.categoryRepository = categoryRepository;
        this.venueRepository = venueRepository;

    }

    public Event createEvent(
            EventRequest request,
            Organizer organizer){

        Event event = new Event();

        event.setTitle(request.getTitle());

        event.setDescription(request.getDescription());

        event.setPrice(request.getPrice());

        event.setTotalSeats(request.getTotalSeats());

        event.setAvailableSeats(request.getTotalSeats());

        event.setEventStartDatetime(
                request.getEventStartDatetime());

        event.setEventEndDatetime(
                request.getEventEndDatetime());

        event.setCreatedAt(LocalDateTime.now());

        event.setUpdatedAt(LocalDateTime.now());

        event.setOrganizer(organizer);

        event.setCategory(

                categoryRepository.findById(
                        request.getCategoryId())

                        .orElseThrow()

        );

        event.setVenue(

                venueRepository.findById(
                        request.getVenueId())

                        .orElseThrow()

        );

        event.setStatus(Status.ACTIVE);

        return eventRepository.save(event);

    }

    public List<Event> getEvents(
            Organizer organizer){

        return eventRepository.findByOrganizer(
                organizer);

    }

}