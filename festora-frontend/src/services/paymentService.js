import api from "./api";

export const pay = (bookingId) => {

    return api.put(`/payments/${bookingId}`);

}