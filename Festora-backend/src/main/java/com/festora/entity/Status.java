package com.festora.entity;

public enum Status {
	ACTIVE,           // Approved & open for booking

	FULL,             // Available seats = 0

	STARTED,          // Current time >= eventStartDatetime

	COMPLETED,        // Current time > eventEndDatetime

	INACTIVE,         // Cancelled / Rejected by organizer/admin

	PENDING,          // Pending Admin approval

	PENDING_APPROVAL, // Pending Admin approval (alias for clarity)

	CANCELLED         // Cancelled reservation
}