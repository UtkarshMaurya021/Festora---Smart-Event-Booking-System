package com.festora.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
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

	private Integer quantity;

	private Double totalAmount;

	private LocalDateTime bookingDate;

	@Enumerated(EnumType.STRING)
	private Status status;

	@ManyToOne
	private User user;

	@ManyToOne
	private Event event;

}