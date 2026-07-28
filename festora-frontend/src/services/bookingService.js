import api from "./api";

export const bookEvent = (data) => {
    return api.post("/bookings", data);
};

export const getMyBookings = () => {
    return api.get("/bookings/my");
};