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

    private Integer quantity;

    private String seatNumbers;

    private Double totalAmount;

    private LocalDateTime bookingDate;

    private String status;

    public BookingResponse(Long bookingId, Long eventId, String eventTitle, String eventImageUrl, Integer quantity, Double totalAmount, LocalDateTime bookingDate, String status) {
        this.bookingId = bookingId;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.eventImageUrl = eventImageUrl;
        this.quantity = quantity;
        this.seatNumbers = "General";
        this.totalAmount = totalAmount;
        this.bookingDate = bookingDate;
        this.status = status;
    }
}