package com.festora.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {

    private String status;   // SUCCESS or FAILED

    private String message;

    // Kept for backward compatibility with the existing single-QR success
    // screen: mirrors the first ticket in `tickets` below.
    private String ticketNumber; // populated only on SUCCESS

    // The rest are populated only on SUCCESS, so the frontend can render
    // the QR ticket straight after payment without a second round trip.
    private String qrCodePath;

    private Long bookingId;

    private String eventTitle;

    private String venueName;

    private Integer quantity;

    // One entry per seat booked (booking.quantity), per the ER diagram's
    // Booking (1) -> Ticket (N) relationship. The full set is always
    // available afterwards via GET /api/tickets/my.
    private List<TicketSummary> tickets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketSummary {
        private String ticketNumber;
        private String qrCodePath;
    }

}