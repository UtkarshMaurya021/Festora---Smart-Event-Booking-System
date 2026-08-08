package com.festora.controller;

import org.springframework.web.bind.annotation.*;

import com.festora.dto.PaymentConfirmRequest;
import com.festora.dto.PaymentInitResponse;
import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentResult;
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
	public PaymentInitResponse createOrder(@RequestBody PaymentRequest request) {
		return paymentService.createOrder(request);
	}

	@PostMapping("/confirm")
	public PaymentResult confirm(@RequestBody PaymentConfirmRequest request) throws Exception {
		return paymentService.confirmPayment(request);
	}

	@PostMapping("/fail")
	public String fail(@RequestBody PaymentRequest request) {
		paymentService.markFailed(request.getBookingId());
		return "Payment marked as failed";
	}

	@PostMapping("/razorpay/create-order")
	public RazorpayOrderResponse createRazorpayOrder(@RequestBody MapRequest request) {
		return paymentService.createRazorpayOrder(request.getBookingId());
	}

	@PostMapping("/razorpay/verify")
	public PaymentResult verifyRazorpayPayment(@RequestBody PaymentConfirmRequest request) throws Exception {
		return paymentService.verifyRazorpayPayment(request);
	}

	public static class MapRequest {
		private Long bookingId;

		public Long getBookingId() {
			return bookingId;
		}

		public void setBookingId(Long bookingId) {
			this.bookingId = bookingId;
		}
	}
}