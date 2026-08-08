import React, { useState, useEffect } from "react";
import "./SeatPicker.css";

export const TIER_CONFIG = [
  { row: "A", name: "VVIP / Diamond", percentage: 10, multiplier: 2.5, cssClass: "tier-1-vvip", tag: "VVIP (10% | 2.5x)" },
  { row: "B", name: "VIP / Platinum", percentage: 15, multiplier: 2.0, cssClass: "tier-2-vip", tag: "VIP (15% | 2.0x)" },
  { row: "C", name: "Premium / Gold", percentage: 20, multiplier: 1.5, cssClass: "tier-3-premium", tag: "Premium (20% | 1.5x)" },
  { row: "D", name: "Executive / Silver", percentage: 25, multiplier: 1.2, cssClass: "tier-4-executive", tag: "Executive (25% | 1.2x)" },
  { row: "E", name: "Standard / General", percentage: 15, multiplier: 1.0, cssClass: "tier-5-standard", tag: "Standard (15% | 1.0x)" },
  { row: "F", name: "Standard / General", percentage: 15, multiplier: 1.0, cssClass: "tier-5-standard", tag: "Standard (15% | 1.0x)" },
];

export const SeatPicker = ({
  basePrice = 500,
  totalSeatsRequired = 1,
  onSeatSelect,
  initialSeats = [],
  occupiedSeats = []
}) => {
  const [selectedSeats, setSelectedSeats] = useState(initialSeats);

  const allReserved = Array.from(new Set(["A-3", "B-5", "C-2", "D-6", "E-4", ...occupiedSeats]));

  const getSeatMultiplier = (seatCode) => {
    const rowChar = seatCode.split("-")[0];
    const tier = TIER_CONFIG.find((t) => t.row === rowChar);
    return tier ? tier.multiplier : 1.0;
  };

  const getSeatPrice = (seatCode) => {
    return Math.round(basePrice * getSeatMultiplier(seatCode));
  };

  const calculateTotalPrice = (seatsList) => {
    return seatsList.reduce((sum, seatCode) => sum + getSeatPrice(seatCode), 0);
  };

  const handleSeatClick = (seatCode) => {
    if (allReserved.includes(seatCode)) return;

    let updated = [];
    if (selectedSeats.includes(seatCode)) {
      updated = selectedSeats.filter((s) => s !== seatCode);
    } else {
      if (selectedSeats.length >= totalSeatsRequired) {
        updated = [...selectedSeats.slice(1), seatCode];
      } else {
        updated = [...selectedSeats, seatCode];
      }
    }

    setSelectedSeats(updated);
    const totalPrice = calculateTotalPrice(updated);

    if (onSeatSelect) {
      onSeatSelect(updated, totalPrice);
    }
  };

  const autoSelectTierSeats = (targetRow) => {
    const tierSeats = [];
    for (let i = 1; i <= 10; i++) {
      const code = `${targetRow}-${i}`;
      if (!allReserved.includes(code)) {
        tierSeats.push(code);
      }
      if (tierSeats.length === totalSeatsRequired) break;
    }

    setSelectedSeats(tierSeats);
    const totalPrice = calculateTotalPrice(tierSeats);

    if (onSeatSelect) {
      onSeatSelect(tierSeats, totalPrice);
    }
  };

  useEffect(() => {
    if (initialSeats.length > 0) {
      setSelectedSeats(initialSeats);
    }
  }, [initialSeats]);

  const currentTotalPrice = calculateTotalPrice(selectedSeats);

  return (
    <div className="seat-picker-container shadow-lg">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge bg-success bg-opacity-20 text-success border border-success px-3 py-2 rounded-pill fw-semibold small">
          🔒 Synchronized Real-Time Seat Lock Active (Prevents Double Booking)
        </span>
        <span className="text-muted small">
          Reserved / Occupied: <strong>{allReserved.length}</strong>
        </span>
      </div>

      <div className="screen-indicator">
        <div className="screen-curve">🎬 SCREEN / STAGE STAGE FRONT</div>
      </div>

      <div className="tier-legend-bar">
        <button
          type="button"
          className="legend-chip vvip btn btn-link text-decoration-none"
          onClick={() => autoSelectTierSeats("A")}
          title="Auto-select VVIP Row A Seats"
        >
          <span className="dot"></span> Tier 1: VVIP (10% | ₹{Math.round(basePrice * 2.5)})
        </button>

        <button
          type="button"
          className="legend-chip vip btn btn-link text-decoration-none"
          onClick={() => autoSelectTierSeats("B")}
          title="Auto-select VIP Row B Seats"
        >
          <span className="dot"></span> Tier 2: VIP (15% | ₹{Math.round(basePrice * 2.0)})
        </button>

        <button
          type="button"
          className="legend-chip premium btn btn-link text-decoration-none"
          onClick={() => autoSelectTierSeats("C")}
          title="Auto-select Premium Row C Seats"
        >
          <span className="dot"></span> Tier 3: Premium (20% | ₹{Math.round(basePrice * 1.5)})
        </button>

        <button
          type="button"
          className="legend-chip executive btn btn-link text-decoration-none"
          onClick={() => autoSelectTierSeats("D")}
          title="Auto-select Executive Row D Seats"
        >
          <span className="dot"></span> Tier 4: Executive (25% | ₹{Math.round(basePrice * 1.2)})
        </button>

        <button
          type="button"
          className="legend-chip standard btn btn-link text-decoration-none"
          onClick={() => autoSelectTierSeats("E")}
          title="Auto-select Standard Rows E/F Seats"
        >
          <span className="dot"></span> Tier 5: Standard (30% | ₹{Math.round(basePrice * 1.0)})
        </button>
      </div>

      <div className="seat-grid">
        {TIER_CONFIG.map((tier) => (
          <div key={tier.row} className={`seat-row ${tier.cssClass}`}>
            <span className="row-label">{tier.row}</span>
            <div className="seats-group">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const seatCode = `${tier.row}-${num}`;
                const isSelected = selectedSeats.includes(seatCode);
                const isReserved = allReserved.includes(seatCode);
                const isAisle = num === 5;
                const price = getSeatPrice(seatCode);

                return (
                  <React.Fragment key={seatCode}>
                    <button
                      type="button"
                      disabled={isReserved}
                      onClick={() => handleSeatClick(seatCode)}
                      className={`seat-btn ${tier.cssClass} ${isSelected ? "selected" : ""} ${isReserved ? "reserved" : ""}`}
                      title={isReserved ? `Seat ${seatCode} is already booked` : `${tier.name} (${seatCode}) - ₹${price}`}
                    >
                      {isReserved ? "🔒" : num}
                    </button>
                    {isAisle && <div className="aisle-gap" />}
                  </React.Fragment>
                );
              })}
            </div>
            <span className="row-tier-badge">{tier.tag}</span>
          </div>
        ))}
      </div>

      <div className="seat-summary-box">
        <div className="summary-info">
          <div>
            Booking: <strong>{selectedSeats.length} of {totalSeatsRequired} Seat(s) Selected</strong>
            <span className="selected-seat-names ms-2 text-info">
              {selectedSeats.length > 0 ? `(${selectedSeats.join(", ")})` : "(Click grid or tier buttons above)"}
            </span>
          </div>
          <div className="total-tier-price">
            Total Calculated Amount: <strong className="text-warning fs-5">₹{currentTotalPrice}</strong>
          </div>
        </div>
        {selectedSeats.length < totalSeatsRequired && (
          <p className="seat-warning">
            👉 Please select {totalSeatsRequired - selectedSeats.length} more seat(s) on the grid above to complete your {totalSeatsRequired}-ticket booking.
          </p>
        )}
      </div>
    </div>
  );
};
