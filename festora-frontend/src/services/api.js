import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

// --- Automatic access-token refresh on 401 ---
//
// Plain axios instance (not `api`) so this call never gets caught by the
// interceptors below and doesn't carry a (possibly expired) Authorization
// header.
const refreshClient = axios.create({ baseURL: BASE_URL });

let isRefreshing = false;
let pendingRequests = [];

const onRefreshed = (newToken) => {
  pendingRequests.forEach((callback) => callback(newToken));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config: originalRequest } = error;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (
      response?.status !== 401 ||
      isAuthEndpoint ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (!storedRefreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      refreshClient
        .post("/auth/refresh-token", { refreshToken: storedRefreshToken })
        .then(({ data }) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          isRefreshing = false;
          onRefreshed(data.token);
        })
        .catch((refreshError) => {
          isRefreshing = false;
          onRefreshed(null);
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        });
    }

    return new Promise((resolve, reject) => {
      pendingRequests.push((newToken) => {
        if (!newToken) {
          reject(error);
          return;
        }
        originalRequest.headers.Authorization = "Bearer " + newToken;
        resolve(api(originalRequest));
      });
    });
  }
);

export default api;