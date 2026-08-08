package com.festora.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.festora.dto.BookingRequest;
import com.festora.dto.BookingResponse;
import com.festora.dto.TicketVerificationResponse;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Organizer;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Status;
import com.festora.entity.Ticket;
import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.OrganizerRepository;
import com.festora.repository.PaymentRepository;
import com.festora.repository.TicketRepository;
import com.festora.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

	private final BookingRepository bookingRepository;
	private final EventRepository eventRepository;
	private final UserRepository userRepository;
	private final PaymentRepository paymentRepository;
	private final OrganizerRepository organizerRepository;
	private final TicketRepository ticketRepository;
	private final EmailService emailService;

	private String firstImageUrl(Event event) {
		if (event.getImages() == null || event.getImages().isEmpty()) {
			return null;
		}
		return event.getImages().get(0).getImageUrl();
	}

	public BookingService(BookingRepository bookingRepository, EventRepository eventRepository,
			UserRepository userRepository, PaymentRepository paymentRepository,
			OrganizerRepository organizerRepository, TicketRepository ticketRepository,
			EmailService emailService) {
		this.bookingRepository = bookingRepository;
		this.eventRepository = eventRepository;
		this.userRepository = userRepository;
		this.paymentRepository = paymentRepository;
		this.organizerRepository = organizerRepository;
		this.ticketRepository = ticketRepository;
		this.emailService = emailService;
	}

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

	private BookingResponse mapToBookingResponse(Booking b) {
		Event e = b.getEvent();
		String vName = (e != null && e.getVenue() != null) ? e.getVenue().getVenueName() : "N/A";
		String vAddr = (e != null && e.getVenue() != null) 
				? (e.getVenue().getAddress() + (e.getVenue().getCity() != null ? ", " + e.getVenue().getCity() : ""))
				: "N/A";
		LocalDateTime startDt = (e != null) ? e.getEventStartDatetime() : null;
		LocalDateTime endDt = (e != null) ? e.getEventEndDatetime() : null;

		return new BookingResponse(
				b.getBookingId(),
				e != null ? e.getEventId() : null,
				e != null ? e.getTitle() : "Event",
				e != null ? firstImageUrl(e) : null,
				vName,
				vAddr,
				startDt,
				endDt,
				b.getQuantity(),
				b.getSeatNumbers() != null ? b.getSeatNumbers() : "General Entry",
				b.getTotalAmount(),
				b.getBookingDate(),
				b.getStatus().name()
		);
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

		List<String> alreadyBooked = getBookedSeatsForEvent(event.getEventId());
		List<String> finalSeats = new ArrayList<>();

		String rawTier = (request.getSeatNumbers() != null && !request.getSeatNumbers().isEmpty())
				? request.getSeatNumbers().get(0)
				: "STANDARD";

		String tierPrefix = rawTier.contains("-") ? rawTier.split("-")[0] : rawTier;

		int nextIndex = 1;
		for (int i = 0; i < request.getQuantity(); i++) {
			String candidate = tierPrefix + "-" + nextIndex;
			while (alreadyBooked.contains(candidate)) {
				nextIndex++;
				candidate = tierPrefix + "-" + nextIndex;
			}
			finalSeats.add(candidate);
			alreadyBooked.add(candidate);
		}

		Booking booking = new Booking();
		booking.setUser(user);
		booking.setEvent(event);
		booking.setQuantity(request.getQuantity());
		booking.setSeatNumbers(String.join(", ", finalSeats));

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

		return mapToBookingResponse(saved);
	}

	@Transactional
	public BookingResponse cancelBooking(Long bookingId, String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));

		if (!booking.getUser().getUserId().equals(user.getUserId())) {
			throw new RuntimeException("Unauthorized: You can only cancel your own bookings.");
		}

		if (booking.getStatus() == Status.CANCELLED) {
			throw new RuntimeException("Booking is already cancelled.");
		}

		Event event = booking.getEvent();
		if (event != null && event.getEventStartDatetime() != null) {
			if (!LocalDateTime.now().isBefore(event.getEventStartDatetime())) {
				throw new RuntimeException("Cannot cancel booking because the event has already started.");
			}
		}

		booking.setStatus(Status.CANCELLED);
		Booking updated = bookingRepository.save(booking);

		if (event != null) {
			event.setAvailableSeats(event.getAvailableSeats() + booking.getQuantity());
			if (event.getStatus() == Status.FULL) {
				event.setStatus(Status.ACTIVE);
			}
			eventRepository.save(event);
		}

		paymentRepository.findByBooking(booking).ifPresent(p -> {
			p.setStatus(PaymentStatus.REFUNDED);
			paymentRepository.save(p);
		});

		try {
			emailService.sendBookingCancelledByUserEmail(user, booking);
		} catch (Exception ex) {
			System.err.println("Email dispatch error on user booking cancel: " + ex.getMessage());
		}

		return mapToBookingResponse(updated);
	}

	@Transactional
	public void processAutoRefundsForInactivatedEvent(Event event) {
		if (event == null) return;
		List<Booking> bookings = bookingRepository.findByEvent(event);
		for (Booking b : bookings) {
			if (b.getStatus() != Status.CANCELLED) {
				b.setStatus(Status.CANCELLED);
				bookingRepository.save(b);

				paymentRepository.findByBooking(b).ifPresent(p -> {
					p.setStatus(PaymentStatus.REFUNDED);
					paymentRepository.save(p);
				});

				if (b.getUser() != null) {
					try {
						emailService.sendAutoRefundEmail(b.getUser(), b, event);
					} catch (Exception ex) {
						System.err.println("Auto-refund email dispatch error: " + ex.getMessage());
					}
				}
			}
		}
	}

	public List<BookingResponse> myBookings(String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		return bookingRepository.findByUser(user)
				.stream()
				.map(this::mapToBookingResponse)
				.toList();
	}

	public List<Booking> getOrganizerBookings(String email) {
		User user = userRepository.findByEmail(email).orElse(null);
		if (user == null) {
			return List.of();
		}
		Organizer organizer = organizerRepository.findByUser(user).orElse(null);
		if (organizer == null) {
			return List.of();
		}
		return bookingRepository.findByEventOrganizer(organizer);
	}

	public TicketVerificationResponse verifyTicket(String token) {
		if (token == null || token.trim().isEmpty()) {
			return new TicketVerificationResponse(
					null, "N/A", "N/A", null, "N/A", null, 0, "N/A", 0.0, null,
					"INVALID", false, "❌ INVALID SEARCH: Verification token/code is empty."
			);
		}

		String cleanToken = token.trim();
		Booking booking = null;

		// 1. Try finding by raw numeric ID
		try {
			Long id = Long.parseLong(cleanToken);
			booking = bookingRepository.findById(id).orElse(null);
		} catch (NumberFormatException ignored) {
		}

		// 2. Try finding by Ticket Number (e.g. TKT-19-1)
		if (booking == null) {
			Ticket ticket = ticketRepository.findByTicketNumber(cleanToken).orElse(null);
			if (ticket != null) {
				booking = ticket.getBooking();
			}
		}

		// 3. Try finding by Seat Tier / Numbers (e.g. Executive-9, executive -9, Executive 9)
		if (booking == null) {
			List<Booking> matches = bookingRepository.findBySeatNumbersContainingIgnoreCase(cleanToken);
			if (!matches.isEmpty()) {
				booking = matches.get(0);
			} else {
				String normalizedToken = cleanToken.replaceAll("\\s*-\\s*", "-");
				List<Booking> normMatches = bookingRepository.findBySeatNumbersContainingIgnoreCase(normalizedToken);
				if (!normMatches.isEmpty()) {
					booking = normMatches.get(0);
				} else {
					String compactToken = cleanToken.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
					for (Booking b : bookingRepository.findAll()) {
						if (b.getSeatNumbers() != null) {
							String compactSeat = b.getSeatNumbers().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
							if (compactSeat.contains(compactToken) || compactToken.contains(compactSeat)) {
								booking = b;
								break;
							}
						}
					}
				}
			}
		}

		if (booking == null) {
			return new TicketVerificationResponse(
					null, "N/A", "N/A", null, "N/A", null, 0, "N/A", 0.0, null,
					"INVALID", false, "❌ INVALID TICKET: No booking record found matching '" + token + "'"
			);
		}

		boolean isValid = "ACTIVE".equalsIgnoreCase(booking.getStatus().name())
				|| "CONFIRMED".equalsIgnoreCase(booking.getStatus().name());

		String msg = isValid
				? "✅ VALID TICKET: Entry verified for " + (booking.getUser() != null ? booking.getUser().getName() : "Attendee")
				: "⚠️ TICKET INACTIVE: Current status is " + booking.getStatus().name();

		return new TicketVerificationResponse(
				booking.getBookingId(),
				booking.getUser() != null ? booking.getUser().getName() : "N/A",
				booking.getUser() != null ? booking.getUser().getEmail() : "N/A",
				booking.getEvent() != null ? booking.getEvent().getEventId() : null,
				booking.getEvent() != null ? booking.getEvent().getTitle() : "N/A",
				booking.getEvent() != null ? firstImageUrl(booking.getEvent()) : null,
				booking.getQuantity(),
				booking.getSeatNumbers() != null ? booking.getSeatNumbers() : "General Entry",
				booking.getTotalAmount(),
				booking.getBookingDate(),
				booking.getStatus().name(),
				isValid,
				msg
		);
	}

	public BookingResponse getBooking(Long id, String email) {
	    User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
	    Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

	    if (!booking.getUser().getUserId().equals(user.getUserId())) {
	        throw new RuntimeException("Unauthorized");
	    }

	    return mapToBookingResponse(booking);
	}
}