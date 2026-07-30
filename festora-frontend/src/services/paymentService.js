import api from "./api";

// Start a FestoraPay checkout for this booking -- mints a transaction id
export const createOrder = (bookingId) => {
    return api.post("/payments/create-order", {
        bookingId
    });
};

// Submit the checkout form (method + mock card/UPI details) and get back
// a SUCCESS/FAILED result
export const confirmPayment = (data) => {
    return api.post("/payments/confirm", data);
};

// Called if the user backs out of checkout without submitting
export const markPaymentFailed = (bookingId) => {
    return api.post("/payments/fail", { bookingId });
};