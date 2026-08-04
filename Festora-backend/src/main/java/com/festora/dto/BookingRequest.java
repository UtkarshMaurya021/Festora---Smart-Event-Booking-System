package com.festora.dto;

import java.util.List;
import lombok.Data;

@Data
public class BookingRequest {

    private Long eventId;

    private Integer quantity;

    private List<String> seatNumbers;
}