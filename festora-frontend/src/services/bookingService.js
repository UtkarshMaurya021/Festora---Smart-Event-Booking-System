import axios from "axios";

const API = "http://localhost:8080/api/bookings";

const token = () => localStorage.getItem("token");

export const bookEvent = (booking) =>
    axios.post(API, booking, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    });

export const myBookings = () =>
    axios.get(`${API}/my`, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    });