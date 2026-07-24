package com.festora.controller;

import com.festora.repository.*;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final UserRepository userRepository;
    private final OrganizerRepository organizerRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public AdminController(UserRepository userRepository,
                           OrganizerRepository organizerRepository,
                           EventRepository eventRepository,
                           BookingRepository bookingRepository){

        this.userRepository=userRepository;
        this.organizerRepository=organizerRepository;
        this.eventRepository=eventRepository;
        this.bookingRepository=bookingRepository;

    }

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(){

        Map<String,Object> map=new HashMap<>();

        map.put("users",
                userRepository.count());

        map.put("organizers",
                organizerRepository.count());

        map.put("events",
                eventRepository.count());

        map.put("bookings",
                bookingRepository.count());

        return map;

    }

}