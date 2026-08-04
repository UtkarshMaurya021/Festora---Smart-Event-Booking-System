import api from "./api";

export const getUsers = () => api.get("/admin/users");

export const getEvents = () => api.get("/admin/events");

export const getBookings = () => api.get("/admin/bookings");

export const getPayments = () => api.get("/admin/payments");

export const getPendingEvents = () => api.get("/admin/pending-events");

export const approveEvent = (id) => api.put(`/admin/events/${id}/approve`);

export const rejectEvent = (id) => api.put(`/admin/events/${id}/reject`);

export const updateEventStatus = (id, status) => api.put(`/admin/events/${id}/status?status=${status}`);

export const blockUser = (id) => api.put(`/admin/users/${id}/block`);

export const activateUser = (id) => api.put(`/admin/users/${id}/activate`);

export const deleteEvent = (id) => api.delete(`/admin/events/${id}`);

export const getOrganizerRequests = () => api.get("/admin/organizer-requests");

export const approveOrganizer = (id) => api.put(`/admin/organizer-requests/${id}/approve`);

export const rejectOrganizer = (id) => api.put(`/admin/organizer-requests/${id}/reject`);

export const getEmailLogs = () => api.get("/admin/email-logs");

export const getCategories = () => api.get("/admin/categories");

export const createCategory = (name) => api.post("/admin/categories", { categoryName: name });

export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

export const getVenues = () => api.get("/venues");

export const createVenue = (venueData) => api.post("/admin/venues", venueData);

export const deleteVenue = (id) => api.delete(`/admin/venues/${id}`);