import api from "./api";

export const getUsers = () => api.get("/admin/users");

export const getEvents = () => api.get("/admin/events");

export const blockUser = (id) =>
    api.put(`/admin/users/${id}/block`);

export const activateUser = (id) =>
    api.put(`/admin/users/${id}/activate`);

export const deleteEvent = (id) =>
    api.delete(`/admin/events/${id}`);

export const getOrganizerRequests = () => api.get("/admin/organizer-requests");

export const approveOrganizer = (id) =>
    api.put(`/admin/organizer-requests/${id}/approve`);

export const rejectOrganizer = (id) =>
    api.put(`/admin/organizer-requests/${id}/reject`);

// Add or verify inside src/services/adminService.js

export const getCategories = () => api.get("/admin/categories");
// Only categoryName string or object with name property is passed
export const createCategory = (name) =>
  api.post("/admin/categories", { categoryName: name });
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

export const getVenues = () => api.get("/venues");

export const createVenue = (venueData) => api.post("/admin/venues", venueData);

export const deleteVenue = (id) => api.delete(`/admin/venues/${id}`);