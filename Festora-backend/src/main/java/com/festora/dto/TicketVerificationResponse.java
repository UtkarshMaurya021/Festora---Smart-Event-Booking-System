package com.festora.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketVerificationResponse {

    private Long bookingId;

    private String attendeeName;

    private String attendeeEmail;

    private Long eventId;

    private String eventTitle;

    private String eventImageUrl;

    private Integer quantity;

    private String seatNumbers;

    private Double totalAmount;

    private LocalDateTime bookingDate;

    private String status;

    private boolean valid;

    private String verificationMessage;
}
