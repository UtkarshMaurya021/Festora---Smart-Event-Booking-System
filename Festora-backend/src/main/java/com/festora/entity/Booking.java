package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long bookingId;

	@NotNull(message = "Quantity is required")
	@Min(value = 1, message = "Quantity must be at least 1")
	private Integer quantity;

	private String seatNumbers;

	@NotNull(message = "Total amount is required")
	@PositiveOrZero(message = "Total amount cannot be negative")
	private Double totalAmount;

	@NotNull(message = "Booking date is required")
	private LocalDateTime bookingDate;

	@NotNull(message = "Status is required")
	@Enumerated(EnumType.STRING)
	@Column(columnDefinition = "VARCHAR(50)")
	private Status status;

	@NotNull(message = "User is required")
	@ManyToOne
	private User user;

	@NotNull(message = "Event is required")
	@ManyToOne
	private Event event;

}