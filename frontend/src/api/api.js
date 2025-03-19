import axios from "axios";

const API_URL = "http://localhost:5005"; // Adres backendu

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Obsługuje ciasteczka httpOnly
});

// Nie ustawiamy już request interceptor – AuthContext ustawia axios.defaults.headers

// Interceptor do obsługi 401 i odświeżania tokena
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Wywołanie endpointu odświeżania tokena
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data.accessToken;
        // Uaktualnienie globalnego nagłówka axiosa
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        // Aktualizacja tokenu w kontekście – globalna funkcja, ustawiana przez AuthContext
        if (typeof window.updateAccessToken === "function") {
          window.updateAccessToken(newToken);
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
