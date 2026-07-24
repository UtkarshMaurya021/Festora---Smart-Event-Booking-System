package com.festora.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.festora.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

}