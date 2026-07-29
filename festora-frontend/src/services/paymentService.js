import api from "./api";

export const createOrder = (bookingId) => {
    return api.post("/payments/create-order", {
        bookingId
    });
};

export const verifyPayment = (data) => {
    return api.post("/payments/verify", data);
};