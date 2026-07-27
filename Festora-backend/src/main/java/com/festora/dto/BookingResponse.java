package com.festora.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BookingResponse {

    private Long bookingId;

    private String eventTitle;

    private Integer quantity;

    private Double totalAmount;

    private LocalDateTime bookingDate;

    private String status;

}