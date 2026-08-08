package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.festora.dto.PaymentConfirmRequest;
import com.festora.dto.PaymentInitResponse;
import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentResult;
import com.festora.dto.RazorpayOrderResponse;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Payment;
import com.festora.entity.PaymentMethod;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Ticket;
import com.festora.repository.BookingRepository;
import com.festora.repository.PaymentRepository;

@Service
public class PaymentService {

    private static final String FAILING_UPI_ID = "fail@festora";
    private static final String FAILING_CARD_SUFFIX = "0000";
    private static final String MICROSERVICE_URL = "http://localhost:8081/api/razorpay";

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;
    private final EmailService emailService;
    private final RazorpayService razorpayService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Random random = new Random();

    public PaymentService(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            TicketService ticketService,
            EmailService emailService,
            RazorpayService razorpayService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.ticketService = ticketService;
        this.emailService = emailService;
        this.razorpayService = razorpayService;
    }

    /**
     * Razorpay Microservice Integration: Delegates order creation to Port 8081 with fallback
     */
    @Transactional
    public RazorpayOrderResponse createRazorpayOrder(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setBooking(booking);
                    newPayment.setAmount(booking.getTotalAmount());
                    newPayment.setPaymentDate(LocalDateTime.now());
                    newPayment.setStatus(PaymentStatus.PENDING);
                    return paymentRepository.save(newPayment);
                });

        RazorpayOrderResponse response;

        try {
            Map<String, Object> payload = Map.of(
                    "bookingId", booking.getBookingId(),
                    "amount", booking.getTotalAmount(),
                    "eventTitle", booking.getEvent() != null ? booking.getEvent().getTitle() : "Festora Event",
                    "userName", booking.getUser() != null ? booking.getUser().getName() : "Attendee",
                    "userEmail", booking.getUser() != null ? booking.getUser().getEmail() : "attendee@festora.com",
                    "userPhone", booking.getUser() != null ? booking.getUser().getPhone() : "9999999999"
            );
            response = restTemplate.postForObject(MICROSERVICE_URL + "/create-order", payload, RazorpayOrderResponse.class);
            System.out.println("✅ Order created via Standalone Payment Microservice (Port 8081): " + response.getRazorpayOrderId());
        } catch (Exception ex) {
            System.err.println("⚠️ Standalone Payment Microservice offline on 8081, running local Razorpay component: " + ex.getMessage());
            response = razorpayService.createRazorpayOrder(booking);
        }

        if (response != null && payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setTransactionId(response.getRazorpayOrderId());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
        }

        return response;
    }

    /**
     * Razorpay Microservice Integration: Delegates HMAC signature verification to Port 8081 with fallback
     */
    @Transactional
    public PaymentResult verifyRazorpayPayment(PaymentConfirmRequest request) throws Exception {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setBooking(booking);
                    newPayment.setAmount(booking.getTotalAmount());
                    newPayment.setPaymentDate(LocalDateTime.now());
                    newPayment.setStatus(PaymentStatus.PENDING);
                    return paymentRepository.save(newPayment);
                });

        boolean isValidSignature;

        try {
            Map<String, Object> verifyPayload = Map.of(
                    "bookingId", request.getBookingId(),
                    "razorpayOrderId", request.getRazorpayOrderId() != null ? request.getRazorpayOrderId() : "",
                    "razorpayPaymentId", request.getRazorpayPaymentId() != null ? request.getRazorpayPaymentId() : "",
                    "razorpaySignature", request.getRazorpaySignature() != null ? request.getRazorpaySignature() : ""
            );
            Map microserviceResult = restTemplate.postForObject(MICROSERVICE_URL + "/verify-signature", verifyPayload, Map.class);
            isValidSignature = microserviceResult != null && Boolean.TRUE.equals(microserviceResult.get("verified"));
            System.out.println("✅ Signature verified via Standalone Payment Microservice (Port 8081): " + isValidSignature);
        } catch (Exception ex) {
            System.err.println("⚠️ Microservice offline on 8081, running local HMAC verification: " + ex.getMessage());
            isValidSignature = razorpayService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );
        }

        if (!isValidSignature) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return new PaymentResult("FAILED", "Razorpay payment signature verification failed", null, null, null, null, null, null, null, null, null, null, null, null);
        }

        PaymentMethod selectedMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.RAZORPAY;
        payment.setPaymentMethod(selectedMethod);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId(request.getRazorpayPaymentId() != null ? request.getRazorpayPaymentId() : request.getRazorpayOrderId());
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        List<Ticket> tickets = ticketService.generateTicket(booking);

        if (booking.getUser() != null) {
            try {
                System.out.println("🚀 Triggering booking email to: " + booking.getUser().getEmail() + " for Booking #" + booking.getBookingId());
                emailService.sendTicketBookedEmail(booking.getUser(), booking, tickets);
            } catch (Exception ex) {
                System.err.println("Booking email notification error: " + ex.getMessage());
            }
        }

        return successResult(booking, tickets, "Razorpay payment successfully verified via Payment Microservice");
    }

    @Transactional
    public PaymentInitResponse createOrder(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalStateException("Payment record not found for this booking"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setTransactionId(generateTransactionId());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
        }

        return new PaymentInitResponse(
                payment.getTransactionId(),
                booking.getTotalAmount(),
                "INR",
                booking.getBookingId(),
                booking.getEvent().getTitle(),
                booking.getQuantity(),
                booking.getUser().getName(),
                booking.getUser().getEmail(),
                booking.getUser().getPhone()
        );
    }

    @Transactional
    public PaymentResult confirmPayment(PaymentConfirmRequest request) throws Exception {
        if (request.getRazorpayOrderId() != null && request.getRazorpayPaymentId() != null) {
            return verifyRazorpayPayment(request);
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseGet(() -> {
                    Payment newPayment = new Payment();
                    newPayment.setBooking(booking);
                    newPayment.setAmount(booking.getTotalAmount());
                    newPayment.setPaymentDate(LocalDateTime.now());
                    newPayment.setStatus(PaymentStatus.PENDING);
                    return paymentRepository.save(newPayment);
                });

        if (payment.getTransactionId() == null || payment.getTransactionId().isBlank() || !payment.getTransactionId().equals(request.getTransactionId())) {
            payment.setTransactionId(request.getTransactionId() != null && !request.getTransactionId().isBlank() ? request.getTransactionId() : generateTransactionId());
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            List<Ticket> existingTickets = ticketService.generateTicket(booking);
            if (booking.getUser() != null) {
                try {
                    emailService.sendTicketBookedEmail(booking.getUser(), booking, existingTickets);
                } catch (Exception ex) {
                    System.err.println("Booking email notification error: " + ex.getMessage());
                }
            }
            return successResult(booking, existingTickets, "Payment already completed");
        }

        boolean declined = isDeclined(request);

        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CARD);
        payment.setPaymentDate(LocalDateTime.now());

        if (declined) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return new PaymentResult("FAILED", declineReason(request), null, null, null, null, null, null, null, null, null, null, null, null);
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        List<Ticket> tickets = ticketService.generateTicket(booking);

        if (booking.getUser() != null) {
            try {
                System.out.println("🚀 Triggering booking email to: " + booking.getUser().getEmail() + " for Booking #" + booking.getBookingId());
                emailService.sendTicketBookedEmail(booking.getUser(), booking, tickets);
            } catch (Exception ex) {
                System.err.println("Booking email notification error: " + ex.getMessage());
            }
        }

        return successResult(booking, tickets, "Payment successful");
    }

    private PaymentResult successResult(Booking booking, List<Ticket> tickets, String message) {
        PaymentResult result = new PaymentResult();
        result.setStatus("SUCCESS");
        result.setMessage(message);

        Ticket firstTicket = tickets.isEmpty() ? null : tickets.get(0);
        result.setTicketNumber(firstTicket != null ? firstTicket.getTicketNumber() : null);
        result.setQrCodePath(firstTicket != null ? firstTicket.getQrCodePath() : null);

        result.setBookingId(booking.getBookingId());
        
        Event e = booking.getEvent();
        if (e != null) {
            result.setEventTitle(e.getTitle());
            if (e.getVenue() != null) {
                result.setVenueName(e.getVenue().getVenueName());
                result.setVenueAddress(e.getVenue().getAddress() + (e.getVenue().getCity() != null ? ", " + e.getVenue().getCity() : ""));
            }
            if (e.getEventStartDatetime() != null) {
                result.setEventStartDatetime(e.getEventStartDatetime().toString());
            }
            if (e.getEventEndDatetime() != null) {
                result.setEventEndDatetime(e.getEventEndDatetime().toString());
            }
        }
        
        result.setSeatNumbers(booking.getSeatNumbers());
        result.setTotalAmount(booking.getTotalAmount());
        result.setQuantity(booking.getQuantity());
        
        result.setTickets(
                tickets.stream()
                        .map(t -> new PaymentResult.TicketSummary(t.getTicketNumber(), t.getQrCodePath()))
                        .toList()
        );
        return result;
    }

    @Transactional
    public void markFailed(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for this booking"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }
    }

    private boolean isDeclined(PaymentConfirmRequest request) {
        if (request.getPaymentMethod() == null) return false;
        switch (request.getPaymentMethod()) {
            case CARD:
                String card = request.getCardNumber() == null ? "" : request.getCardNumber().replaceAll("\\s", "");
                return card.endsWith(FAILING_CARD_SUFFIX);
            case UPI:
                return FAILING_UPI_ID.equalsIgnoreCase(request.getUpiId());
            case NETBANKING:
            case WALLET:
            default:
                return false;
        }
    }

    private String declineReason(PaymentConfirmRequest request) {
        if (request.getPaymentMethod() == null) return "Payment declined";
        switch (request.getPaymentMethod()) {
            case CARD:
                return "Card declined by issuing bank (insufficient funds)";
            case UPI:
                return "UPI payment declined by the payer's bank";
            default:
                return "Payment declined";
        }
    }

    private String generateTransactionId() {
        String digits = String.format("%06d", random.nextInt(1_000_000));
        return "FPAY" + System.currentTimeMillis() + digits;
    }
}