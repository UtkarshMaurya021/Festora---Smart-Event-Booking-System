package com.festora.service;

import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.festora.dto.EventSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

@Service
public class EventService {

@Autowired
private BookingRepository bookingRepository;

private final EventRepository eventRepository;
private final OrganizerRepository organizerRepository;
private final UserRepository userRepository;
private final CategoryRepository categoryRepository;
private final VenueRepository venueRepository;
private final EventImageRepository eventImageRepository;

public EventService(EventRepository eventRepository, OrganizerRepository organizerRepository,
UserRepository userRepository, CategoryRepository categoryRepository, VenueRepository venueRepository,
EventImageRepository eventImageRepository) {

this.eventRepository = eventRepository;
this.organizerRepository = organizerRepository;
this.userRepository = userRepository;
this.categoryRepository = categoryRepository;
this.venueRepository = venueRepository;
this.eventImageRepository = eventImageRepository;
}

// ===========================
// CREATE EVENT
// ===========================
public Event create(EventRequest request, String email) {

User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

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

Event saved = eventRepository.save(event);

saveImages(saved, request.getImageUrls());

return saved;
}

// ===========================
// MY EVENTS
// ===========================
public List<Event> getMyEvents(String email) {

User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

Organizer organizer = organizerRepository.findByUser(user).orElseGet(() -> {
Organizer newOrganizer = new Organizer();
newOrganizer.setUser(user);
return organizerRepository.save(newOrganizer);
});

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

Event saved = eventRepository.save(event);

replaceImages(saved, request.getImageUrls());

return saved;
}

// ===========================
// DELETE EVENT
// ===========================
public void deleteEvent(Long id, String email) {

User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

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

// Keeps a single event's status in sync when its list is fetched
// on-demand (mirrors the logic in the @Scheduled updateExpiredEvents()
// job below). STARTED once eventStartDatetime has passed, COMPLETED
// once eventEndDatetime has passed. Only auto-transitions events that
// are still in the live ACTIVE/FULL/STARTED lifecycle so it never
// resurrects an event an organizer/admin has explicitly deactivated.
private void updateEventStatus(Event event) {
if (event.getStatus() != Status.ACTIVE
&& event.getStatus() != Status.FULL
&& event.getStatus() != Status.STARTED) {
return;
}

LocalDateTime now = LocalDateTime.now();

if (event.getEventEndDatetime() != null && !now.isBefore(event.getEventEndDatetime())) {
event.setStatus(Status.COMPLETED);
} else if (event.getEventStartDatetime() != null && !now.isBefore(event.getEventStartDatetime())) {
event.setStatus(Status.STARTED);
} else if (event.getAvailableSeats() != null && event.getAvailableSeats() == 0) {
event.setStatus(Status.FULL);
} else {
event.setStatus(Status.ACTIVE);
}

event.setUpdatedAt(now);
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

// Runs every minute. Flips an event's status automatically once its
// organizer-set start/end time arrives: STARTED once eventStartDatetime
// has passed, COMPLETED once eventEndDatetime has passed, FULL if it
// sells out before starting. Requires @EnableScheduling on the main
// application class (added) to actually run.
@Scheduled(fixedRate = 60000) // Every 1 minute
public void updateExpiredEvents() {

LocalDateTime now = LocalDateTime.now();

List<Event> events = eventRepository.findByStatusIn(
List.of(Status.ACTIVE, Status.FULL, Status.STARTED));

for (Event event : events) {

if (event.getEventEndDatetime() != null && !now.isBefore(event.getEventEndDatetime())) {
event.setStatus(Status.COMPLETED);

} else if (event.getEventStartDatetime() != null && !now.isBefore(event.getEventStartDatetime())) {
event.setStatus(Status.STARTED);

} else if (event.getAvailableSeats() != null && event.getAvailableSeats() == 0) {
event.setStatus(Status.FULL);

} else {
event.setStatus(Status.ACTIVE);
}

event.setUpdatedAt(now);
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

return eventRepository.findByOrganizerAndStatusIn(organizer,
List.of(Status.ACTIVE, Status.FULL, Status.STARTED));
}

// ===========================
// IMAGE HELPERS
// ===========================

private void saveImages(Event event, List<String> urls) {
if (urls == null || urls.isEmpty()) return;

List<EventImage> images = new ArrayList<>();
for (String url : urls) {
if (url == null || url.isBlank()) continue;
String trimmed = url.trim();
if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) continue;

EventImage img = new EventImage();
img.setImageUrl(trimmed);
img.setUploadedAt(LocalDateTime.now());
img.setEvent(event);
// First image in the list is the primary/cover image, per the ER diagram's is_primary flag.
img.setIsPrimary(images.isEmpty());
images.add(img);
}

if (!images.isEmpty()) {
eventImageRepository.saveAll(images);
}
}

private void replaceImages(Event event, List<String> urls) {
List<EventImage> existing = event.getImages();
if (existing != null && !existing.isEmpty()) {
eventImageRepository.deleteAll(existing);
existing.clear();
}
saveImages(event, urls);
}
}