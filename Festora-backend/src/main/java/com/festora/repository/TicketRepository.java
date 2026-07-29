package com.festora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.festora.entity.Booking;
import com.festora.entity.Ticket;

public interface TicketRepository
extends JpaRepository<Ticket,Long>{

    Optional<Ticket> findByBooking(Booking booking);

}