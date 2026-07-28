package com.festora.service;

import org.springframework.stereotype.Service;

import com.festora.entity.Booking;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.repository.BookingRepository;
import com.festora.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    private final BookingRepository bookingRepository;

    public PaymentService(

            PaymentRepository paymentRepository,

            BookingRepository bookingRepository){

        this.paymentRepository=paymentRepository;

        this.bookingRepository=bookingRepository;

    }
   
    public Payment createOrder(Long bookingId) { 

        Booking booking=bookingRepository.findById(bookingId)

                .orElseThrow();

        Payment payment=paymentRepository.findByBooking(booking)

                .orElseThrow();

        payment.setStatus(PaymentStatus.SUCCESS);

        paymentRepository.save(payment);

        return payment;

    }
    
}