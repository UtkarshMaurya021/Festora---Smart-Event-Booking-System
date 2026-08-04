package com.festora.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequest {

    private String title;

    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime eventStartDatetime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime eventEndDatetime;

    private Double price;

    private Integer totalSeats;

    private Long categoryId;

    private Long venueId;

    private List<String> imageUrls;
}