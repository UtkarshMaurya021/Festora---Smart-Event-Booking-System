package com.festora.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.festora.entity.Payment;
import com.festora.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Changed from @PutMapping to @PostMapping to match Step 121
    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<Payment> createRazorpayOrder(@PathVariable Long bookingId) {
        // Calls the service layer to read booking, calculate amount, talk to Razorpay, and save PENDING payment
        Payment pendingPayment = paymentService.createOrder(bookingId);
        return new ResponseEntity<>(pendingPayment, HttpStatus.CREATED);
    }
}
