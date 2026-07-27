package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.festora.dto.BookingRequest;
import com.festora.dto.BookingResponse;
import com.festora.dto.EventSummaryResponse;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final EventRepository eventRepository;
	private final UserRepository userRepository;

	public BookingService(BookingRepository bookingRepository, EventRepository eventRepository,
			UserRepository userRepository) {

		this.bookingRepository = bookingRepository;
		this.eventRepository = eventRepository;
		this.userRepository = userRepository;
	}

	public BookingResponse bookEvent(BookingRequest request, String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		Event event = eventRepository.findById(request.getEventId())
				.orElseThrow(() -> new RuntimeException("Event not found"));

		if (event.getStatus() != Status.ACTIVE) {
			throw new RuntimeException("Event is not available");
		}

		if (request.getQuantity() <= 0) {
			throw new RuntimeException("Invalid quantity");
		}

		if (event.getAvailableSeats() < request.getQuantity()) {
			throw new RuntimeException("Seats not available");
		}

		Booking booking = new Booking();

		booking.setUser(user);
		booking.setEvent(event);
		booking.setQuantity(request.getQuantity());

		booking.setTotalAmount(event.getPrice() * request.getQuantity());

		booking.setBookingDate(LocalDateTime.now());

		booking.setStatus(Status.ACTIVE);

		event.setAvailableSeats(event.getAvailableSeats() - request.getQuantity());

		eventRepository.save(event);

		Booking saved = bookingRepository.save(booking);

		return new BookingResponse(

				saved.getBookingId(),

				saved.getEvent().getTitle(),

				saved.getQuantity(),

				saved.getTotalAmount(),

				saved.getBookingDate(),

				saved.getStatus().name()

		);

	}

	public List<BookingResponse> myBookings(String email) {

		User user = userRepository.findByEmail(email).orElseThrow();

		return bookingRepository.findByUser(user)

				.stream()

				.map(b -> new BookingResponse(

						b.getBookingId(),

						b.getEvent().getTitle(),

						b.getQuantity(),

						b.getTotalAmount(),

						b.getBookingDate(),

						b.getStatus().name()

				))

				.toList();

	}

}