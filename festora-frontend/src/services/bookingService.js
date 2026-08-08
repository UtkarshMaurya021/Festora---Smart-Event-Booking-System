import api from "./api";

export const bookEvent = (data) => {
    return api.post("/bookings", data);
};
export const getBooking = (id) => {
    return api.get(`/bookings/${id}`);
};
export const getMyBookings = () => {
  return api.get("/bookings/userbooking");
};
export const cancelBooking = (id) => {
  return api.put(`/bookings/cancel/${id}`);
};