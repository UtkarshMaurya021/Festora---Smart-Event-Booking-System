package com.festora.dto;

import com.festora.entity.Role;

import jakarta.validation.constraints.*;
import lombok.*;
@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 50)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must contain at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // getters and setters
}