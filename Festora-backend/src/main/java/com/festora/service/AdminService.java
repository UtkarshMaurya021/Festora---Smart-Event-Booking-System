package com.festora.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.festora.dto.AdminDashboardResponse;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Role;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.BookingRepository;
import com.festora.repository.EventRepository;
import com.festora.repository.PaymentRepository;
import com.festora.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public AdminService(UserRepository userRepository, EventRepository eventRepository,
            PaymentRepository paymentRepository, BookingRepository bookingRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
    }

    public AdminDashboardResponse getDashboard() {
        long users = userRepository.countByRole(Role.ROLE_USER);
        long organizers = userRepository.countByRoleAndStatus(Role.ROLE_ORGANIZER, Status.ACTIVE);
        long events = eventRepository.count();
        Double revenue = paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS);

        List<AdminDashboardResponse.OrganizerRequestSummary> organizerRequests = getPendingOrganizers()
                .stream()
                .map(u -> new AdminDashboardResponse.OrganizerRequestSummary(
                        u.getUserId(),
                        u.getName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getCreatedAt()))
                .collect(Collectors.toList());

        return new AdminDashboardResponse(
                users,
                organizers,
                events,
                revenue,
                organizerRequests);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByBookingDateDesc();
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc();
    }

    public List<User> getPendingOrganizers() {
        return userRepository.findByRoleAndStatus(Role.ROLE_ORGANIZER, Status.PENDING);
    }

    public User approveOrganizer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizer request not found"));

        if (user.getRole() != Role.ROLE_ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }

        user.setStatus(Status.ACTIVE);
        User saved = userRepository.save(user);

        try {
            emailService.sendOrganizerApprovedEmail(saved);
        } catch (Exception ex) {
            System.err.println("Email dispatch log: " + ex.getMessage());
        }

        return saved;
    }

    public User rejectOrganizer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizer request not found"));

        if (user.getRole() != Role.ROLE_ORGANIZER) {
            throw new RuntimeException("User is not an organizer");
        }

        user.setStatus(Status.INACTIVE);
        return userRepository.save(user);
    }

    public List<Event> getPendingEvents() {
        return eventRepository.findByStatusIn(List.of(Status.PENDING, Status.PENDING_APPROVAL));
    }

    public Event approveEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setStatus(Status.ACTIVE);
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        try {
            if (saved.getOrganizer() != null && saved.getOrganizer().getUser() != null) {
                emailService.sendEventApprovedEmail(saved.getOrganizer().getUser(), saved);
            }
        } catch (Exception ex) {
            System.err.println("Email dispatch log: " + ex.getMessage());
        }

        return saved;
    }

    public Event rejectEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setStatus(Status.INACTIVE);
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        try {
            if (saved.getOrganizer() != null && saved.getOrganizer().getUser() != null) {
                emailService.sendEventRejectedEmail(saved.getOrganizer().getUser(), saved);
            }
        } catch (Exception ex) {
            System.err.println("Email dispatch log: " + ex.getMessage());
        }

        return saved;
    }

    public User blockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(Status.INACTIVE);
        return userRepository.save(user);
    }

    public User activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(Status.ACTIVE);
        return userRepository.save(user);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(Status.INACTIVE);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepository.save(event);

        try {
            if (event.getOrganizer() != null && event.getOrganizer().getUser() != null) {
                emailService.sendEventCancelledEmail(event.getOrganizer().getUser(), event);
            }
            notifyAttendeesForEvent(event, "EVENT_CANCELLED");
        } catch (Exception ex) {
            System.err.println("Email dispatch log: " + ex.getMessage());
        }
    }

    public Event updateEventStatus(Long id, Status newStatus) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setStatus(newStatus);
        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);

        try {
            if (newStatus == Status.STARTED) {
                notifyAttendeesForEvent(saved, "EVENT_STARTED");
            } else if (newStatus == Status.COMPLETED) {
                notifyAttendeesForEvent(saved, "EVENT_COMPLETED");
            } else if (newStatus == Status.INACTIVE) {
                notifyAttendeesForEvent(saved, "EVENT_CANCELLED");
            }
        } catch (Exception ex) {
            System.err.println("Email dispatch log: " + ex.getMessage());
        }

        return saved;
    }

    private void notifyAttendeesForEvent(Event event, String notificationType) {
        List<Booking> bookings = bookingRepository.findByEvent(event);
        Set<Long> notifiedUserIds = new HashSet<>();

        for (Booking booking : bookings) {
            User attendee = booking.getUser();
            if (attendee != null && !notifiedUserIds.contains(attendee.getUserId())) {
                notifiedUserIds.add(attendee.getUserId());
                try {
                    if ("EVENT_CANCELLED".equals(notificationType)) {
                        emailService.sendEventCancelledEmail(attendee, event);
                    } else if ("EVENT_STARTED".equals(notificationType)) {
                        emailService.sendEventStartedEmail(attendee, event);
                    } else if ("EVENT_COMPLETED".equals(notificationType)) {
                        emailService.sendEventCompletedEmail(attendee, event);
                    }
                } catch (Exception ex) {
                    System.err.println("Error notifying attendee: " + ex.getMessage());
                }
            }
        }
    }
}