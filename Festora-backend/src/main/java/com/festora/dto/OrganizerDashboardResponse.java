package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrganizerDashboardResponse {

    private Long totalEvents;

    private Long activeEvents;

    private Long totalBookings;

    private Double revenue;

}