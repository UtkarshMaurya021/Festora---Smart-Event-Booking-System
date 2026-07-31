package com.festora.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequest {

    private String title;

    private String description;

    private LocalDateTime eventStartDatetime;

    private LocalDateTime eventEndDatetime;

    private Double price;

    private Integer totalSeats;

    private Long categoryId;

    private Long venueId;
    private List<String> imageUrls;
}