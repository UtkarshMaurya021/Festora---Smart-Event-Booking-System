package com.festora.controller;

import com.festora.dto.UserProfileResponse;
import com.festora.entity.Event;
import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.UserRepository;
import com.festora.service.EventService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

	private final UserRepository userRepository;
	private final BookingRepository bookingRepository;
	private final EventService eventService;

	public UserController(UserRepository userRepository, BookingRepository bookingRepository, EventService eventService) {
		this.userRepository = userRepository;
		this.bookingRepository = bookingRepository;
		this.eventService = eventService;
	}

	@GetMapping("/dashboard")
	public Map<String, Object> dashboard(Authentication authentication) {

		User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
		
		// Fetch the list of active events from your service layer
		List<Event> activeEvents = eventService.getAllActiveEvents();

		Map<String, Object> map = new HashMap<>();

		map.put("name", user.getName());
		map.put("email", user.getEmail());
		map.put("bookings", bookingRepository.countByUser(user));
		map.put("tickets", bookingRepository.countByUser(user));
		
		// ADD THIS: Calculate total active events count dynamically
		map.put("upcoming", activeEvents.size()); 

		// ADD THIS: Attach the list using the exact hyphenated key name your React app expects [1]
		map.put("active-events", activeEvents); 

		return map;
	}

	@GetMapping("/active-events")
	public List<Event> getAllEvents() {
		return eventService.getAllActiveEvents();
	}
	
	@GetMapping("/profile")
	public UserProfileResponse getProfile(Authentication authentication) {
		User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

		return new UserProfileResponse(
				user.getName(),
				user.getEmail(),
				user.getPhone(),
				user.getRole() != null ? user.getRole().name() : null,
				user.getStatus() != null ? user.getStatus().name() : null,
				user.getCreatedAt()
		);
}}