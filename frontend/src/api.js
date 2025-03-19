import axios from "axios";

const API_URL = "http://localhost:5005";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// ✅ Ustawienie funkcji refreshToken w interceptory (przekazanej z AuthContext)
export const setupAxiosInterceptors = (refreshToken) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        try {
          await refreshToken(); // ✅ Odświeżamy token
          return api.request(error.config); // ✅ Ponawiamy oryginalne zapytanie
        } catch (refreshError) {
          console.error("Błąd odświeżania tokena:", refreshError);
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;

// =========================
// 🔹 AUTORYZACJA (LOGIN / LOGOUT)
// =========================

// ✅ Logowanie użytkownika
export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Błąd logowania:", error);
    return { error: "Nie udało się zalogować." };
  }
};

// ✅ Wylogowanie użytkownika
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Błąd podczas wylogowania:", error);
  }
};

// =========================
// 🔹 ZAPROSZENIA (INVITATIONS)
// =========================

export const sendInvitation = async (email, inviter, token) => {
  try {
    const response = await api.post(
      "/admin/send-invitation",
      { email, inviter },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Błąd podczas wysyłania zaproszenia:", error);
    return { error: "Nie udało się wysłać zaproszenia" };
  }
};

// ✅ Pobieranie listy zaproszeń
export const fetchInvitations = async (token) => {
  try {
    const response = await api.get("/admin/invitations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania zaproszeń:", error);
    return { error: "Nie udało się pobrać zaproszeń" };
  }
};

// ✅ Ponowne wysłanie zaproszenia
export const resendInvitation = async (id, token) => {
  try {
    const response = await api.post(
      `/admin/resend-invitation/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Błąd podczas ponownego wysyłania zaproszenia:", error);
    return { error: "Nie udało się ponownie wysłać zaproszenia" };
  }
};

// ✅ Usunięcie zaproszenia
export const deleteInvitation = async (id, token) => {
  try {
    const response = await api.delete(`/admin/invitations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas usuwania zaproszenia:", error);
    return { error: "Nie udało się usunąć zaproszenia" };
  }
};

// ✅ Edycja zaproszenia
export const editInvitation = async (id, updatedData, token) => {
  try {
    const response = await api.put(`/admin/invitations/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas edytowania zaproszenia:", error);
    return { error: "Nie udało się edytować zaproszenia." };
  }
};

// =========================
// 🔹 TESTY (QUIZ)
// =========================

export const fetchTest = async (link) => {
  try {
    const response = await api.get(`/api/test/${link}`);
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania testu:", error);
    return { error: "Nie udało się pobrać testu" };
  }
};

export const submitTest = async (link, answers) => {
  try {
    const response = await api.post(`/api/test/${link}/submit`, { answers });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas przesyłania testu:", error);
    return { error: "Nie udało się przesłać testu" };
  }
};

// =========================
// 🔹 PYTANIA (QUESTIONS)
// =========================

export const fetchQuestions = async (token) => {
  try {
    const response = await api.get("/admin/questions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania pytań:", error);
    return { error: "Nie udało się pobrać pytań" };
  }
};

// ✅ Dodawanie nowego pytania
export const addQuestion = async (question, token) => {
  try {
    const response = await api.post("/admin/questions", question, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas dodawania pytania:", error);
    return { error: "Nie udało się dodać pytania" };
  }
};

// ✅ Edytowanie pytania
export const editQuestion = async (id, updatedData, token) => {
  try {
    const response = await api.put(`/admin/questions/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas edytowania pytania:", error);
    return { error: "Nie udało się edytować pytania" };
  }
};

// ✅ Usuwanie pytania
export const deleteQuestion = async (id, token) => {
  try {
    const response = await api.delete(`/admin/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Błąd podczas usuwania pytania:", error);
    return { error: "Nie udało się usunąć pytania" };
  }
};

// ✅ Weryfikacja kodu dostępu
export const verifyAccessCode = async (code) => {
  try {
    const response = await api.get(`/api/verify-access/${code}`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas weryfikacji kodu:", error);
    return { error: "Nie udało się zweryfikować kodu. Spróbuj ponownie." };
  }
};
