import api from "./api";

export const register = (data) => {
    return api.post("/auth/register", data);
}

export const login = (data) => {
    return api.post("/auth/login", data);
}

export const forgotPassword = (email) => {
    return api.post("/auth/forgot-password", { email });
}

export const resetPassword = (data) => {
    return api.post("/auth/reset-password", data);
}

export const refreshToken = (refreshToken) => {
    return api.post("/auth/refresh-token", { refreshToken });
}

export const logout = () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const request = storedRefreshToken
        ? api.post("/auth/logout", { refreshToken: storedRefreshToken }).catch(() => {})
        : Promise.resolve();

    return request.finally(() => {
        localStorage.clear();
    });
}