package com.festora.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.festora.entity.Booking;
import com.festora.entity.Ticket;

public interface TicketRepository
extends JpaRepository<Ticket,Long>{

    List<Ticket> findAllByBooking(Booking booking);

}