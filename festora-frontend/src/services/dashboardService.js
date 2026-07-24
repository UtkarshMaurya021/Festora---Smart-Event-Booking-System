import api from "./api";

export const getUserDashboard=()=>{

    return api.get("/user/dashboard");

}

export const getOrganizerDashboard=()=>{

    return api.get("/organizer/dashboard");

}

export const getAdminDashboard=()=>{

    return api.get("/admin/dashboard");

}