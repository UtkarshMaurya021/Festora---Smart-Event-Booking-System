import api from "./api";

export const createOrder = (bookingId) => {
    return api.post("/payments/create-order", {
        bookingId
    });
};

export const verifyPayment = (data) => {
    return api.post("/payments/verify", data);
};

export const markPaymentFailed = (bookingId) => {
    return api.post("/payments/fail", { bookingId });
};