package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import com.festora.entity.Event;
import com.festora.entity.Status;
import com.festora.entity.User;
import com.festora.repository.EventRepository;
import com.festora.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public AdminService(UserRepository userRepository, EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
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
    }
}
