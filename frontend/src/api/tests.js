import api from "./api";

export const fetchTest = async (link) => {
  try {
    const response = await api.get(`/api/test/${link}`);
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania testu:", error.response?.data || error);
    return { error: "Nie udało się pobrać testu. Sprawdź kod zaproszenia." };
  }
};

export const submitTestAnswers = async (link, answers) => {
  try {
    const formattedAnswers = Object.entries(answers).map(
      ([id, selectedOption]) => ({
        questionId: parseInt(id),
        selectedOption,
      })
    );
    const response = await api.post(`/api/test/${link}/submit`, {
      answers: formattedAnswers,
    });
    return response.data;
  } catch (error) {
    console.error("Błąd przesyłania testu:", error.response?.data || error);
    return { error: "Nie udało się przesłać odpowiedzi. Spróbuj ponownie." };
  }
};
