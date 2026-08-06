package com.festora.payment.controller;

import org.springframework.web.bind.annotation.*;

import com.festora.payment.dto.RazorpayOrderRequest;
import com.festora.payment.dto.RazorpayOrderResponse;
import com.festora.payment.dto.RazorpayVerifyRequest;
import com.festora.payment.dto.RazorpayVerifyResponse;
import com.festora.payment.service.RazorpayMicroservice;

@RestController
@RequestMapping("/api/razorpay")
@CrossOrigin("*")
public class RazorpayPaymentController {

    private final RazorpayMicroservice microservice;

    public RazorpayPaymentController(RazorpayMicroservice microservice) {
        this.microservice = microservice;
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "⚡ FESTORA RAZORPAY PAYMENT MICROSERVICE IS ONLINE & HEALTHY (Port 8081)";
    }

    @PostMapping("/create-order")
    public RazorpayOrderResponse createOrder(@RequestBody RazorpayOrderRequest request) {
        return microservice.createOrder(request);
    }

    @PostMapping("/verify-signature")
    public RazorpayVerifyResponse verifySignature(@RequestBody RazorpayVerifyRequest request) {
        return microservice.verifySignature(request);
    }
}
