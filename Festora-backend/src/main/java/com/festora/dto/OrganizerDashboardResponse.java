package com.festora.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class OrganizerDashboardResponse {

    private Long totalEvents;

    private Long activeEvents;

    private Long fullEvents;

    private Long startedEvents;

    private Long completedEvents;

    private Long cancelledEvents;

    private Long totalTicketsBooked;

    private Double totalRevenue;

}