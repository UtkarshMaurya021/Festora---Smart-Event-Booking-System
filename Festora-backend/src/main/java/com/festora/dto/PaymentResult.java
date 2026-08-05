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

    private String ticketNumber;

    private String qrCodePath;

    private Long bookingId;

    private String eventTitle;

    private String venueName;

    private String venueAddress;

    private String eventStartDatetime;

    private String eventEndDatetime;

    private String seatNumbers;

    private Double totalAmount;

    private Integer quantity;

    private List<TicketSummary> tickets;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketSummary {
        private String ticketNumber;
        private String qrCodePath;
    }

}