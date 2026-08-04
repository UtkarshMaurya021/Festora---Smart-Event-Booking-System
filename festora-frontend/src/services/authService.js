import api from "./api";

export const register = (data) => {

    return api.post("/auth/register", data);

}

export const login = (data) => {

    return api.post("/auth/login", data);

}

export const refreshToken = (refreshToken) => {

    return api.post("/auth/refresh-token", { refreshToken });

}

export const logout = () => {

    const storedRefreshToken = localStorage.getItem("refreshToken");

    // Best-effort: revoke the refresh token server-side, but always clear
    // local storage even if the request fails (e.g. offline, already expired).
    const request = storedRefreshToken
        ? api.post("/auth/logout", { refreshToken: storedRefreshToken }).catch(() => {})
        : Promise.resolve();

    return request.finally(() => {
        localStorage.clear();
    });

}