import api from "./api";
export const getUserCategories = () =>
    api.get("/categories");

export const getUserVenues = () =>
    api.get("/venues");
export const getCategories = () =>
    api.get("/admin/categories");

export const addCategory = (data) =>
    api.post("/admin/categories", data);

export const updateCategory = (id, data) =>
    api.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id) =>
    api.delete(`/admin/categories/${id}`);

export const getVenues = () =>
    api.get("/admin/venues");

export const addVenue = (data) =>
    api.post("/admin/venues", data);

export const updateVenue = (id, data) =>
    api.put(`/admin/venues/${id}`, data);

export const deleteVenue = (id) =>
    api.delete(`/admin/venues/${id}`);