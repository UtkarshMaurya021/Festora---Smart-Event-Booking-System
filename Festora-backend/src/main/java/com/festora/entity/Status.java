package com.festora.entity;

public enum Status {
	ACTIVE, // Open for booking

	FULL, // Available seats = 0

	STARTED, // Current time >= eventStartDatetime

	COMPLETED, // Current time > eventEndDatetime

	INACTIVE // Cancelled by organizer/admin
, PENDING

}