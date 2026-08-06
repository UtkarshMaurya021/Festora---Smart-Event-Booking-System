import api from "./api";

// Start a FestoraPay checkout for this booking -- mints a transaction id
export const createOrder = (bookingId) => {
    return api.post("/payments/create-order", {
        bookingId
    });
};

// Submit the checkout form (method + card/UPI/netbanking details) and get back
// a SUCCESS/FAILED result
export const confirmPayment = (data) => {
    return api.post("/payments/confirm", data);
};

// Called if the user backs out of checkout without submitting
export const markPaymentFailed = (bookingId) => {
    return api.post("/payments/fail", { bookingId });
};

// --- Razorpay Gateway Microservice Integration ---

export const createRazorpayOrder = (bookingId) => {
    return api.post("/payments/razorpay/create-order", { bookingId });
};

export const verifyRazorpayPayment = (data) => {
    return api.post("/payments/razorpay/verify", data);
};