package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import com.festora.entity.Status;
@Getter
@Setter
@NoArgsConstructor  // Added: Crucial for JSON deserialization by Jackson
@AllArgsConstructor
public class EventSummaryResponse {

    private Long eventId;

    private String title;

    private String category;

    private String venue;

    private Integer totalSeats;

    private Integer availableSeats;

    private Integer bookedSeats;

    private Long totalBookings;

    private BigDecimal revenue; // Corrected: Changed from Double to BigDecimal to prevent financial rounding errors

    private Status status;
}
