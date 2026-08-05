package com.festora.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.festora.dto.PaymentConfirmRequest;
import com.festora.dto.PaymentInitResponse;
import com.festora.dto.PaymentRequest;
import com.festora.dto.PaymentResult;
import com.festora.entity.Booking;
import com.festora.entity.Event;
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Ticket;
import com.festora.repository.BookingRepository;
import com.festora.repository.PaymentRepository;

@Service
public class PaymentService {

    private static final String FAILING_UPI_ID = "fail@festora";
    private static final String FAILING_CARD_SUFFIX = "0000";

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;
    private final EmailService emailService;
    private final Random random = new Random();

    public PaymentService(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            TicketService ticketService,
            EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.ticketService = ticketService;
        this.emailService = emailService;
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
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found for this booking"));

        if (payment.getTransactionId() == null
                || !payment.getTransactionId().equals(request.getTransactionId())) {
            throw new IllegalArgumentException("Transaction ID does not match this booking");
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

        payment.setPaymentMethod(request.getPaymentMethod());
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