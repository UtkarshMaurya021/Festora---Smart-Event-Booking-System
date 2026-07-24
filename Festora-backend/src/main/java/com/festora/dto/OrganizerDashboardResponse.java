package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrganizerDashboardResponse {

    private Long events;

    private Long bookings;

    private Double revenue;

}