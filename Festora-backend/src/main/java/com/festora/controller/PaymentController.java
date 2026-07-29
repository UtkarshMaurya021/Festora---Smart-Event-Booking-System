package com.festora.controller;

import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;

import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentVerificationRequest;
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
	public String createOrder(@RequestBody PaymentRequest request) throws Exception {

		JSONObject object = paymentService.createOrder(request);

		return object.toString();

	}

	@PostMapping("/verify")
	public String verify(@RequestBody PaymentVerificationRequest request) throws Exception {

		paymentService.verify(request);

		return "Payment Successful";

	}

}