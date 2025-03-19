import api from "./api";

export const fetchQuestions = async () => {
  try {
    const response = await api.get("/admin/questions");
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania pytań:", error.response?.data || error);
    return { error: "Nie udało się pobrać pytań" };
  }
};

export const addQuestion = async (question) => {
  try {
    await api.post("/admin/questions", question);
    return true;
  } catch (error) {
    console.error("Błąd dodawania pytania:", error.response?.data || error);
    return false;
  }
};

export const editQuestion = async (id, updatedData) => {
  try {
    await api.put(`/admin/questions/${id}`, updatedData);
    return true;
  } catch (error) {
    console.error("Błąd edytowania pytania:", error.response?.data || error);
    return false;
  }
};

export const deleteQuestion = async (id) => {
  try {
    await api.delete(`/admin/questions/${id}`);
    return true;
  } catch (error) {
    console.error("Błąd usuwania pytania:", error.response?.data || error);
    return false;
  }
};
