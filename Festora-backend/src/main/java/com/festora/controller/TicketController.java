package com.festora.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.festora.entity.Ticket;
import com.festora.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin("*")
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service){

        this.service=service;

    }

    @GetMapping("/my")
    public List<Ticket> myTickets(
            Authentication auth){

        return service.myTickets(
                auth.getName()
        );

    }

}