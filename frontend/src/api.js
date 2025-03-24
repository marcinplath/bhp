import axios from "axios";

const API_URL = "http://localhost:5005";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const setupAxiosInterceptors = (refreshToken) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        try {
          await refreshToken();
          return api.request(error.config);
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

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Błąd logowania:", error);
    return { error: "Nie udało się zalogować." };
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Błąd podczas wylogowania:", error);
  }
};

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

export const verifyAccessCode = async (code) => {
  try {
    const response = await api.get(`/api/verify-access/${code}`);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas weryfikacji kodu:", error);
    return { error: "Nie udało się zweryfikować kodu. Spróbuj ponownie." };
  }
};
