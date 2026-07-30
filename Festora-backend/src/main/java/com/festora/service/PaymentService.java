package com.festora.service;

import java.time.LocalDateTime;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentVerificationRequest;
import com.festora.dto.RazorpayOrderResponse;
import com.festora.entity.Booking;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.repository.BookingRepository;
import com.festora.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;
    private RazorpayClient razorpayClient;

    public PaymentService(
            BookingRepository bookingRepository, 
            PaymentRepository paymentRepository, 
            TicketService ticketService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.ticketService = ticketService;
    }

    @PostConstruct
    public void init() throws Exception {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    @Transactional
    public RazorpayOrderResponse createOrder(PaymentRequest request) throws Exception {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (booking.getTotalAmount() * 100));
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "BOOK_" + booking.getBookingId());

        Order order = razorpayClient.orders.create(orderRequest);

        String orderId = order.get("id");
        String currency = order.get("currency");
        int amount = order.get("amount");

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalStateException("Payment record not found for this booking"));
        payment.setRazorpayOrderId(orderId);
        paymentRepository.save(payment);

        return new RazorpayOrderResponse(
                orderId,
                keyId,
                amount,
                currency,
                booking.getUser().getName(),
                booking.getUser().getEmail(),
                booking.getUser().getPhone()
        );
    }

    @Transactional
    public void verify(PaymentVerificationRequest request) throws Exception {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for this booking"));

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean valid = Utils.verifyPaymentSignature(options, keySecret);
        if (!valid) {
            throw new SecurityException("Invalid Razorpay signature verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        ticketService.generateTicket(payment.getBooking());
    }

    @Transactional
    public void markFailed(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for this booking"));

        // Only downgrade if it hasn't already succeeded (avoid clobbering a real success)
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }
}