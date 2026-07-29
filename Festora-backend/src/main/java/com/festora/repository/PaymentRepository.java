package com.festora.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.festora.entity.Booking;
import com.festora.entity.Payment;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBooking(Booking booking);

}