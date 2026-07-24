package com.festora.repository;

import com.festora.entity.Booking;
import com.festora.entity.User;
import com.festora.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByUser(User user);

    long countByEvent(Event event);

}