package com.festora.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.*;
import com.festora.repository.EventRepository;
import com.festora.repository.UserRepository;
import com.festora.repository.VenueRepository;
import com.festora.repository.BookingRepository;
import com.festora.entity.Status;
import com.festora.entity.Role;

@RestController
@RequestMapping("/api/public")
@CrossOrigin("*")
public class PublicController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;

    public PublicController(EventRepository eventRepository, UserRepository userRepository,
                            VenueRepository venueRepository, BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getPublicStats() {
        long activeEvents = eventRepository.countByStatus(Status.ACTIVE);
        long organizers = userRepository.countByRoleAndStatus(Role.ROLE_ORGANIZER, Status.ACTIVE);
        long venues = venueRepository.count();
        long bookings = bookingRepository.count();

        return Map.of(
            "activeEvents", activeEvents,
            "organizers", organizers,
            "venues", venues,
            "totalBookings", bookings
        );
    }
}
