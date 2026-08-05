package com.festora.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {

    private Long bookingId;

    private Long eventId;

    private String eventTitle;

    private String eventImageUrl;

    private String venueName;

    private String venueAddress;

    private LocalDateTime eventStartDatetime;

    private LocalDateTime eventEndDatetime;

    private Integer quantity;

    private String seatNumbers;

    private Double totalAmount;

    private LocalDateTime bookingDate;

    private String status;
}