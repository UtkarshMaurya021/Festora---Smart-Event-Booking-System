import api from "./api";

export const createOrder = (bookingId) => {
    return api.post("/payments/create-order", {
        bookingId
    });
};

export const confirmPayment = (data) => {
    return api.post("/payments/confirm", data);
};

export const markPaymentFailed = (bookingId) => {
    return api.post("/payments/fail", { bookingId });
};

export const createRazorpayOrder = (bookingId) => {
    return api.post("/payments/razorpay/create-order", { bookingId });
};

export const verifyRazorpayPayment = (data) => {
    return api.post("/payments/razorpay/verify", data);
};