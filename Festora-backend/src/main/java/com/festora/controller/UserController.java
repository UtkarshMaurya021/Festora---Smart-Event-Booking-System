package com.festora.controller;

import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {

	private final UserRepository userRepository;
	private final BookingRepository bookingRepository;

	public UserController(UserRepository userRepository, BookingRepository bookingRepository) {

		this.userRepository = userRepository;
		this.bookingRepository = bookingRepository;

	}

	@GetMapping("/dashboard")
	public Map<String, Object> dashboard(Authentication authentication) {

		User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

		Map<String, Object> map = new HashMap<>();

		map.put("name", user.getName());

		map.put("email", user.getEmail());

		map.put("bookings", bookingRepository.countByUser(user));

		map.put("tickets", bookingRepository.countByUser(user));

		return map;

	}

}