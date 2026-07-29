package com.festora.service;

import java.time.LocalDateTime;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentVerificationRequest;
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
    public JSONObject createOrder(PaymentRequest request) throws Exception {
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

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setRazorpayOrderId(orderId);
        paymentRepository.save(payment);

        JSONObject response = new JSONObject();
        response.put("orderId", orderId);
        response.put("amount", amount);
        response.put("currency", currency);
        response.put("key", keyId);
        response.put("name", booking.getUser().getName());
        response.put("email", booking.getUser().getEmail());
        response.put("phone", booking.getUser().getPhone());
        
        return response;
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
}