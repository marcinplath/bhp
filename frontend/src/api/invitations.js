import api from "./api";

export const createInvitation = async (data) => {
  try {
    const response = await api.post("/admin/send-invitation", data);
    return response.data.invitation;
  } catch (error) {
    console.error("Błąd tworzenia zaproszenia:", error.response?.data || error);
    return null;
  }
};

export const fetchInvitations = async () => {
  try {
    const response = await api.get("/admin/invitations");
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania zaproszeń:", error.response?.data || error);
    return { error: "Nie udało się pobrać zaproszeń" };
  }
};

export const resendInvitation = async (id) => {
  try {
    await api.post(`/admin/resend-invitation/${id}`);
    return true;
  } catch (error) {
    console.error(
      "Błąd ponownego wysłania zaproszenia:",
      error.response?.data || error
    );
    return false;
  }
};

export const deleteInvitation = async (id) => {
  try {
    await api.delete(`/admin/invitations/${id}`);
    return true;
  } catch (error) {
    console.error("Błąd usuwania zaproszenia:", error.response?.data || error);
    return false;
  }
};

export const editInvitation = async (id, updatedData) => {
  try {
    await api.put(`/admin/invitations/${id}`, updatedData);
    return true;
  } catch (error) {
    console.error(
      "Błąd edytowania zaproszenia:",
      error.response?.data || error
    );
    return false;
  }
};
