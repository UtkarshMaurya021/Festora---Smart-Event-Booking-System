package com.festora.controller;

import org.springframework.web.bind.annotation.*;

import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentVerificationRequest;
import com.festora.dto.RazorpayOrderResponse;
import com.festora.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

	private final PaymentService paymentService;

	public PaymentController(PaymentService paymentService) {

		this.paymentService = paymentService;

	}

	@PostMapping("/create-order")
	public RazorpayOrderResponse createOrder(@RequestBody PaymentRequest request) throws Exception {

		return paymentService.createOrder(request);

	}

	@PostMapping("/verify")
	public String verify(@RequestBody PaymentVerificationRequest request) throws Exception {

		paymentService.verify(request);

		return "Payment Successful";

	}

	@PostMapping("/fail")
	public String fail(@RequestBody PaymentRequest request) {

		paymentService.markFailed(request.getBookingId());

		return "Payment marked as failed";

	}

}