import api from "./api";

export const fetchUserData = async () => {
  try {
    const response = await api.get("/auth/user");
    return response.data;
  } catch (error) {
    console.error(
      "Błąd pobierania danych użytkownika:",
      error.response?.data || error
    );
    return null;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    // Backend powinien zwrócić accessToken – AuthContext zajmie się jego przechowywaniem
    if (response.data.accessToken) {
      // Uaktualnienie domyślnego nagłówka axiosa (AuthContext to zrobi też)
      api.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;
      return response.data.accessToken;
    }
    return null;
  } catch (error) {
    console.error("Błąd logowania:", error.response?.data || error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
    // Po wylogowaniu usuwamy globalny nagłówek
    delete api.defaults.headers.common.Authorization;
  } catch (error) {
    console.error("Błąd podczas wylogowywania:", error.response?.data || error);
  }
};
