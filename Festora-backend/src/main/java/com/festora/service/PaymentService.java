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
import com.festora.entity.Payment;
import com.festora.entity.PaymentStatus;
import com.festora.entity.Ticket;
import com.festora.repository.BookingRepository;
import com.festora.repository.PaymentRepository;

/**
 * FestoraPay -- an in-house, zero-dependency mock payment gateway.
 *
 * It follows the exact same shape as a real gateway (Razorpay/Stripe/etc.)
 * so the flow is easy to explain and easy to later swap for a real one:
 *
 *   1. createOrder()   -> mints a transactionId for this booking, PENDING
 *   2. confirmPayment() -> the "checkout" step; decides SUCCESS/FAILED using
 *                          magic test values (exactly how real sandboxes work)
 *   3. markFailed()     -> called if the user abandons checkout without
 *                          submitting (closes the tab, hits back, etc.)
 *
 * Simulated outcome rules (documented so it's trivial to demo/explain):
 *   - CARD: a number ending in "0000"      -> declined
 *   - UPI:  the id "fail@festora"          -> declined
 *   - NETBANKING / WALLET: always succeed
 *   - everything else                       -> succeeds
 */
@Service
public class PaymentService {

    private static final String FAILING_UPI_ID = "fail@festora";
    private static final String FAILING_CARD_SUFFIX = "0000";

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final TicketService ticketService;
    private final Random random = new Random();

    public PaymentService(
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository,
            TicketService ticketService) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.ticketService = ticketService;
    }

    @Transactional
    public PaymentInitResponse createOrder(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new IllegalStateException("Payment record not found for this booking"));

        // Already paid -- don't mint a new transaction, just reuse it
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
            // Already confirmed earlier (e.g. duplicate click). generateTicket()
            // is idempotent, so this just fetches the tickets that were already
            // issued instead of silently returning an empty ticket list.
            List<Ticket> existingTickets = ticketService.generateTicket(booking);
            return successResult(booking, existingTickets, "Payment already completed");
        }

        boolean declined = isDeclined(request);

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentDate(LocalDateTime.now());

        if (declined) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return new PaymentResult("FAILED", declineReason(request), null, null, null, null, null, null, null);
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        List<Ticket> tickets = ticketService.generateTicket(booking);

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
        result.setEventTitle(booking.getEvent() != null ? booking.getEvent().getTitle() : null);
        result.setVenueName(
                booking.getEvent() != null && booking.getEvent().getVenue() != null
                        ? booking.getEvent().getVenue().getVenueName()
                        : null
        );
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

        // Only downgrade if it hasn't already succeeded (avoid clobbering a real success)
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