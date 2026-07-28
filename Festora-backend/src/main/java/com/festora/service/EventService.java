package com.festora.service;

import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.List;
import com.festora.dto.EventSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.festora.dto.EventRequest;
import com.festora.dto.OrganizerDashboardResponse;
import com.festora.entity.Booking;
import com.festora.entity.Category;
import com.festora.entity.Event;
import com.festora.entity.EventImage;
import com.festora.entity.Organizer;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.entity.Venue;
import com.festora.repository.BookingRepository;
import com.festora.repository.CategoryRepository;
import com.festora.repository.EventImageRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.OrganizerRepository;
import com.festora.repository.UserRepository;
import com.festora.repository.VenueRepository;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class EventService {
	@Autowired
	private BookingRepository bookingRepository;

	private final EventRepository eventRepository;
	private final OrganizerRepository organizerRepository;
	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;
	private final VenueRepository venueRepository;

	public EventService(EventRepository eventRepository, OrganizerRepository organizerRepository,
			UserRepository userRepository, CategoryRepository categoryRepository, VenueRepository venueRepository) {

		this.eventRepository = eventRepository;
		this.organizerRepository = organizerRepository;
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
		this.venueRepository = venueRepository;
	}

	// ===========================
	// CREATE EVENT
	// ===========================
	public Event create(EventRequest request, String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		// AUTO-FIX: Automatically creates organizer record if missing or unlinked
		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		Category category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new RuntimeException("Category not found"));

		Venue venue = venueRepository.findById(request.getVenueId())
				.orElseThrow(() -> new RuntimeException("Venue not found"));

		Event event = new Event();

		event.setTitle(request.getTitle());
		event.setDescription(request.getDescription());
		event.setEventStartDatetime(request.getEventStartDatetime());
		event.setEventEndDatetime(request.getEventEndDatetime());

		event.setPrice(request.getPrice());

		event.setTotalSeats(request.getTotalSeats());
		event.setAvailableSeats(request.getTotalSeats());

		event.setStatus(Status.ACTIVE);

		event.setCreatedAt(LocalDateTime.now());
		event.setUpdatedAt(LocalDateTime.now());

		event.setOrganizer(organizer);
		event.setCategory(category);
		event.setVenue(venue);

		return eventRepository.save(event);
	}

	// ===========================
	// MY EVENTS
	// ===========================
	public List<Event> getMyEvents(String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		// AUTO-FIX: Fetch or automatically create organizer record if missing
		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		// Fetch all events for this organizer, regardless of status,
		// so deleted/expired/completed events remain visible and manageable.
		return eventRepository.findByOrganizer(organizer);
	}

	// ===========================
	// GET SINGLE EVENT
	// ===========================
	public Event getEvent(Long id) {

		return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
	}

	// ===========================
	// UPDATE EVENT
	// ===========================
	public Event updateEvent(Long id, EventRequest request, String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		// AUTO-FIX: Automatically creates organizer record if missing or unlinked
		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));

		if (!event.getOrganizer().getOrganizerId().equals(organizer.getOrganizerId())) {
			throw new RuntimeException("Unauthorized");
		}

		Category category = categoryRepository.findById(request.getCategoryId())
				.orElseThrow(() -> new RuntimeException("Category not found"));

		Venue venue = venueRepository.findById(request.getVenueId())
				.orElseThrow(() -> new RuntimeException("Venue not found"));

		// Work out how many seats are already booked so we can carry that
		// number forward when totalSeats changes, instead of leaving
		// availableSeats stuck at its old value.
		int bookedSeats = event.getTotalSeats() - event.getAvailableSeats();

		Integer newTotalSeats = request.getTotalSeats();
		if (newTotalSeats < bookedSeats) {
			throw new RuntimeException("Total seats cannot be less than the " + bookedSeats + " seats already booked");
		}

		event.setTitle(request.getTitle());
		event.setDescription(request.getDescription());
		event.setEventStartDatetime(request.getEventStartDatetime());
		event.setEventEndDatetime(request.getEventEndDatetime());
		event.setPrice(request.getPrice());
		event.setTotalSeats(newTotalSeats);
		event.setAvailableSeats(newTotalSeats - bookedSeats);
		event.setCategory(category);
		event.setVenue(venue);
		event.setUpdatedAt(LocalDateTime.now());

		return eventRepository.save(event);
	}

	// ===========================
	// DELETE EVENT
	// ===========================
	public void deleteEvent(Long id, String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		// AUTO-FIX: Automatically creates organizer record if missing or unlinked
		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));

		if (!event.getOrganizer().getOrganizerId().equals(organizer.getOrganizerId())) {
			throw new RuntimeException("Unauthorized");
		}
		event.setStatus(Status.INACTIVE); // or Status.CANCELLED
		event.setUpdatedAt(LocalDateTime.now());
		eventRepository.save(event);
	}

	public OrganizerDashboardResponse getDashboard(String email) {

		User user = userRepository.findByEmail(email).orElseThrow();

		Organizer organizer = organizerRepository.findByUser(user).orElseThrow();

		List<Booking> bookings = bookingRepository.findByEventOrganizer(organizer);

		long totalTickets = 0;

		double revenue = 0;

		for (Booking booking : bookings) {

			totalTickets += booking.getQuantity();

			revenue += booking.getTotalAmount();

		}

		return new OrganizerDashboardResponse(

				eventRepository.countByOrganizer(organizer),

				eventRepository.countByOrganizerAndStatus(organizer, Status.ACTIVE),

				eventRepository.countByOrganizerAndStatus(organizer, Status.FULL),

				eventRepository.countByOrganizerAndStatus(organizer, Status.STARTED),

				eventRepository.countByOrganizerAndStatus(organizer, Status.COMPLETED),

				eventRepository.countByOrganizerAndStatus(organizer, Status.INACTIVE),

				totalTickets,

				revenue

		);

	}

	public List<Event> getAllActiveEvents() {

		return eventRepository.findByStatus(Status.ACTIVE);
	}

	// ===========================
	// GET AND UPDATE ALL MY EVENTS
	// ===========================
	public List<Event> getAndUpdateOrganizerEvents(String email) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		List<Event> events = eventRepository.findByOrganizer(organizer);

		for (Event event : events) {
			updateEventStatus(event);
		}

		eventRepository.saveAll(events);

		return events;
	}

	// FIX: Added the missing helper method signature so the code compiles.
	private void updateEventStatus(Event event) {
		if (event.getEventEndDatetime() != null && event.getEventEndDatetime().isBefore(LocalDateTime.now())) {
			event.setStatus(Status.INACTIVE);
			event.setUpdatedAt(LocalDateTime.now());
		}
	}

	public List<EventSummaryResponse> getMyEventsSummary(String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		List<Event> events = eventRepository.findByOrganizer(organizer);

		return events.stream().map(event -> {

			int bookedSeats = bookingRepository.sumQuantityByEvent(event);
			Long totalBookings = bookingRepository.countByEvent(event);
			Double revenue = bookingRepository.sumAmountByEvent(event);

			return new EventSummaryResponse(event.getEventId(), event.getTitle(),
					event.getCategory() != null ? event.getCategory().getCategoryName() : null,
					event.getVenue() != null ? event.getVenue().getVenueName() : null, event.getTotalSeats(),
					event.getAvailableSeats(), bookedSeats, totalBookings, java.math.BigDecimal.valueOf(revenue),
					event.getStatus());

		}).toList();
	}

	@Scheduled(fixedRate = 60000) // Every 1 minute
	public void updateExpiredEvents() {

		List<Event> events = eventRepository.findByStatus(Status.ACTIVE);

		LocalDateTime now = LocalDateTime.now();

		for (Event event : events) {

			if (!now.isBefore(event.getEventStartDatetime())) {

				event.setStatus(Status.INACTIVE);

			}

			if (event.getAvailableSeats() == 0) {

				event.setStatus(Status.STARTED);

			}

		}

		eventRepository.saveAll(events);

	}

	public List<Event> getMyActiveEvents(String email) {

		User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

		Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
			Organizer newOrganizer = new Organizer();
			newOrganizer.setUser(user);
			return organizerRepository.save(newOrganizer);
		});

		// Dashboard should only show currently active events
		return eventRepository.findByOrganizerAndStatus(organizer, Status.ACTIVE);
	}
}
