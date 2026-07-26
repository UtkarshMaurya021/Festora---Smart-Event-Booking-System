package com.festora.repository;

import com.festora.entity.Event;
import com.festora.entity.Organizer;
import com.festora.entity.Status;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {
	List<Event> findByOrganizer(Organizer organizer);

	List<Event> findByStatus(Status status);

	long countByOrganizer(Organizer organizer);

	Optional<Event> findByEventId(Long eventId);

	long countByOrganizerAndStatus(Organizer organizer, Status status);

	List<Event> findByOrganizerAndStatus(Organizer organizer, Status active);
}