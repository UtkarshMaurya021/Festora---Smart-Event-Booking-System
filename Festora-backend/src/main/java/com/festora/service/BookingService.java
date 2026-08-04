package com.festora.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.festora.dto.BookingRequest;
import com.festora.dto.BookingResponse;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.PaymentRepository;
import com.festora.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final EventRepository eventRepository;
	private final UserRepository userRepository;
	private final PaymentRepository paymentRepository;

	private String firstImageUrl(Event event) {
		if (event.getImages() == null || event.getImages().isEmpty()) {
			return null;
		}
		return event.getImages().get(0).getImageUrl();
	}

	public BookingService(BookingRepository bookingRepository, EventRepository eventRepository,
			UserRepository userRepository, PaymentRepository paymentRepository) {
		this.bookingRepository = bookingRepository;
		this.eventRepository = eventRepository;
		this.userRepository = userRepository;
		this.paymentRepository = paymentRepository;
	}

	/**
	 * Returns all currently occupied/booked seat numbers for a specific event.
	 * Used for real-time frontend seat grid locking to prevent double booking.
	 */
	public List<String> getBookedSeatsForEvent(Long eventId) {
		Event event = eventRepository.findById(eventId)
				.orElseThrow(() -> new RuntimeException("Event not found"));

		List<Booking> bookings = bookingRepository.findByEvent(event);
		Set<String> occupiedSeats = new HashSet<>();

		for (Booking b : bookings) {
			if (b.getSeatNumbers() != null && !b.getSeatNumbers().isBlank()) {
				String[] seats = b.getSeatNumbers().split(",");
				for (String s : seats) {
					String trimmed = s.trim();
					if (!trimmed.isEmpty() && !trimmed.equalsIgnoreCase("General Entry")) {
						occupiedSeats.add(trimmed);
					}
				}
			}
		}

		return new ArrayList<>(occupiedSeats);
	}

	@Transactional
	public synchronized BookingResponse bookEvent(BookingRequest request, String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		Event event = eventRepository.findById(request.getEventId())
				.orElseThrow(() -> new RuntimeException("Event not found"));

		if (event.getStatus() != Status.ACTIVE) {
			throw new RuntimeException("Event is not available for booking.");
		}

		if (request.getQuantity() <= 0) {
			throw new RuntimeException("Invalid ticket quantity.");
		}

		if (event.getAvailableSeats() < request.getQuantity()) {
			throw new RuntimeException("Insufficient seats available.");
		}

		// Double-Booking Check: Verify no requested seat is already booked by another user
		List<String> alreadyBooked = getBookedSeatsForEvent(event.getEventId());
		if (request.getSeatNumbers() != null && !request.getSeatNumbers().isEmpty()) {
			for (String requestedSeat : request.getSeatNumbers()) {
				if (alreadyBooked.contains(requestedSeat.trim())) {
					throw new RuntimeException("Seat " + requestedSeat.trim() + " has already been booked by another attendee. Please select available seats.");
				}
			}
		}

		Booking booking = new Booking();
		booking.setUser(user);
		booking.setEvent(event);
		booking.setQuantity(request.getQuantity());

		if (request.getSeatNumbers() != null && !request.getSeatNumbers().isEmpty()) {
			booking.setSeatNumbers(String.join(", ", request.getSeatNumbers()));
		} else {
			booking.setSeatNumbers("General Entry");
		}

		booking.setTotalAmount(event.getPrice() * request.getQuantity());
		booking.setBookingDate(LocalDateTime.now());
		booking.setStatus(Status.ACTIVE);

		event.setAvailableSeats(event.getAvailableSeats() - request.getQuantity());
		eventRepository.save(event);

		Booking saved = bookingRepository.save(booking);

		Payment payment = new Payment();
		payment.setBooking(saved);
		payment.setAmount(saved.getTotalAmount());
		payment.setPaymentDate(LocalDateTime.now());
		payment.setStatus(PaymentStatus.PENDING);
		paymentRepository.save(payment);

		return new BookingResponse(
				saved.getBookingId(),
				saved.getEvent().getEventId(),
				saved.getEvent().getTitle(),
				firstImageUrl(saved.getEvent()),
				saved.getQuantity(),
				saved.getSeatNumbers(),
				saved.getTotalAmount(),
				saved.getBookingDate(),
				saved.getStatus().name()
		);
	}

	public List<BookingResponse> myBookings(String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		return bookingRepository.findByUser(user)
				.stream()
				.map(b -> new BookingResponse(
						b.getBookingId(),
						b.getEvent().getEventId(),
						b.getEvent().getTitle(),
						firstImageUrl(b.getEvent()),
						b.getQuantity(),
						b.getSeatNumbers() != null ? b.getSeatNumbers() : "General Entry",
						b.getTotalAmount(),
						b.getBookingDate(),
						b.getStatus().name()
				))
				.toList();
	}

	public BookingResponse getBooking(Long id, String email) {
	    User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
	    Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

	    if (!booking.getUser().getUserId().equals(user.getUserId())) {
	        throw new RuntimeException("Unauthorized");
	    }

	    return new BookingResponse(
	            booking.getBookingId(),
	            booking.getEvent().getEventId(),
	            booking.getEvent().getTitle(),
	            firstImageUrl(booking.getEvent()),
	            booking.getQuantity(),
	            booking.getSeatNumbers() != null ? booking.getSeatNumbers() : "General Entry",
	            booking.getTotalAmount(),
	            booking.getBookingDate(),
	            booking.getStatus().name()
	    );
	}
}