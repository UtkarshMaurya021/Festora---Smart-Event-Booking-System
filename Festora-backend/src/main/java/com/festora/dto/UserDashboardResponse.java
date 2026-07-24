package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDashboardResponse {

    private Long upcomingEvents;

    private Long bookings;

    private Long tickets;

}