package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {

    private Long users;

    private Long organizers;

    private Long events;

    private Double revenue;

}