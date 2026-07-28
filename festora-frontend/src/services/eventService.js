import api from "./api";

export const createEvent = (event) => {

    return api.post("/organizer/events", event);

};

export const getMyEvents = () => {

    return api.get("/organizer/events");

};

export const getEvent = (id) => {

    return api.get(`/organizer/events/${id}`);

};

export const updateEvent = (id,event) => {

    return api.put(`/organizer/events/${id}`,event);

};

export const deleteEvent = (id) => {

    return api.delete(`/organizer/events/${id}`);

};
export const getDashboard = () => {

    return api.get("/organizer/dashboard");

}
export const getAllEvents = () => {

    return api.get("/user/active-events");

};
export const getEventsSummary = () => {

    return api.get("/organizer/events/summary");

}