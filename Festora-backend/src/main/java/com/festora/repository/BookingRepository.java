package com.festora.repository;

import com.festora.entity.Booking;
import com.festora.entity.User;
import com.festora.entity.Event;
import com.festora.entity.Organizer;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	long countByUser(User user);

	List<Booking> findByUser(User user);

	List<Booking> findByEventOrganizer(Organizer organizer);

	Long countByEvent(Event event);

	@Query("""
			SELECT COALESCE(SUM(b.totalAmount),0)
			FROM Booking b
			WHERE b.event = :event
			""")
	Double sumAmountByEvent(@Param("event") Event event);

	@Query("""
			SELECT COALESCE(SUM(b.quantity),0)
			FROM Booking b
			WHERE b.event = :event
			""")
	Integer sumQuantityByEvent(@Param("event") Event event);
}