package com.festora.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Token/OTP is required")
    private String token;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must contain at least 6 characters")
    private String newPassword;
}
