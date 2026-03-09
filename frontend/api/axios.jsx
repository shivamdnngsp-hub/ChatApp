import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: "/api/user",
  withCredentials: true
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {

      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        await api.post("/auth/refresh");

        isRefreshing = false;

        return api(originalRequest);

      } catch (refreshError) {

        isRefreshing = false;

        console.log("Refresh token expired");

        
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;