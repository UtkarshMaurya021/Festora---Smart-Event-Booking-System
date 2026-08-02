package com.festora.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private String name;

    private String email;

    private String phone;

    private String role;

    private String status;

    private LocalDateTime createdAt;
}
