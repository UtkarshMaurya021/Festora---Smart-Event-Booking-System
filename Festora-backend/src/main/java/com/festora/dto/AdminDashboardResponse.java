package com.festora.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {

    private Long users;

    private Long organizers;

    private Long eventsCount;

    private Double revenue;

    private List<OrganizerRequestSummary> organizerRequests;

    @Data
    @AllArgsConstructor
    public static class OrganizerRequestSummary {

        private Long id;

        private String name;

        private String email;

        private String phone;

        private LocalDateTime requestedAt;
    }
}