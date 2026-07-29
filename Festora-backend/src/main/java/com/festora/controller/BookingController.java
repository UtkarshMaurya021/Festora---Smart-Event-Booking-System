package com.festora.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.festora.dto.BookingRequest;
import com.festora.dto.BookingResponse;
import com.festora.entity.Booking;
import com.festora.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin("*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService){

        this.bookingService=bookingService;

    }
    @GetMapping("/{id}")
    public BookingResponse getBooking(
            @PathVariable Long id,
            Authentication authentication){
        return bookingService.getBooking(
                id,
                authentication.getName()
        );
    }
    @PostMapping

    public BookingResponse book(

            @RequestBody BookingRequest request,

            Authentication authentication){

        return bookingService.bookEvent(

                request,

                authentication.getName()

        );

    }

    @GetMapping("/my")

    public List<BookingResponse> myBookings(

            Authentication authentication){

        return bookingService.myBookings(

                authentication.getName()

        );

    }

}