import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchInvitations,
  resendInvitation,
  deleteInvitation,
  editInvitation,
  createInvitation,
} from "../api/invitations";
import ConfirmModal from "../components/ConfirmModal";
import EditInvitationModal from "../components/EditInvitationModal";
import { useAuth } from "../context/AuthContext";

const InvitationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modale
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");

  useEffect(() => {
    const loadInvitations = async () => {
      const data = await fetchInvitations();
      if (data.error) {
        setError(data.error);
      } else {
        setInvitations(data.invitations);
      }
      setLoading(false);
    };
    loadInvitations();
  }, []);

  const handleCreateInvitation = async () => {
    if (!newInviteEmail.trim()) {
      alert("Podaj adres e-mail!");
      return;
    }

    const inviterName = user?.email || "Nieznany uzytkownik";

    const created = await createInvitation({
      email: newInviteEmail,
      inviter: inviterName,
    });

    if (created) {
      setInvitations((prev) => [...prev, created]);
      setNewInviteEmail("");
      alert("Zaproszenie zostało wysłane.");
    } else {
      alert("Błąd tworzenia zaproszenia.");
    }
  };

  const handleResend = async (id) => {
    const success = await resendInvitation(id);
    success
      ? alert("Zaproszenie wysłane ponownie.")
      : alert("Błąd ponownego wysyłania zaproszenia.");
  };

  const handleDelete = async () => {
    if (selectedInvitation) {
      const success = await deleteInvitation(selectedInvitation.id);
      if (success) {
        setInvitations((prev) =>
          prev.filter((invite) => invite.id !== selectedInvitation.id)
        );
      }
      setShowDeleteModal(false);
      setSelectedInvitation(null);
    }
  };

  const handleEdit = (invite) => {
    setSelectedInvitation(invite);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData) => {
    if (selectedInvitation) {
      const success = await editInvitation(selectedInvitation.id, updatedData);
      if (success) {
        setInvitations((prev) =>
          prev.map((invite) =>
            invite.id === selectedInvitation.id
              ? { ...invite, ...updatedData }
              : invite
          )
        );
      }
      setShowEditModal(false);
      setSelectedInvitation(null);
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Ładowanie zaproszeń...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Lista zaproszeń</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => navigate("/admin")}
        >
          ⬅ Powrót
        </button>
      </div>

      {/* Formularz dodawania (tylko e-mail) */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Stwórz nowe zaproszenie</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 mb-3">
          <input
            type="email"
            placeholder="E-mail gościa"
            value={newInviteEmail}
            onChange={(e) => setNewInviteEmail(e.target.value)}
            className="border p-2 rounded w-full sm:w-auto"
          />
          <button
            onClick={handleCreateInvitation}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Wyślij zaproszenie
          </button>
        </div>
        <p className="text-sm text-gray-500">
          „Zapraszający” zostanie pobrany automatycznie z kontekstu aktualnie
          zalogowanego użytkownika.
        </p>
      </div>

      {/* Tabela zaproszeń */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Zapraszający</th>
              <th className="border p-2">Data utworzenia</th>
              <th className="border p-2">Data wygaśnięcia</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invite) => (
              <tr key={invite.id} className="text-center">
                <td className="border p-2">{invite.id}</td>
                <td className="border p-2">{invite.email}</td>
                <td className="border p-2">{invite.inviter}</td>
                <td className="border p-2">
                  {new Date(invite.created_at).toLocaleString()}
                </td>
                <td className="border p-2">
                  {invite.expires_at
                    ? new Date(invite.expires_at).toLocaleString()
                    : "Brak"}
                </td>
                <td className="border p-2">{invite.status}</td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => handleResend(invite.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    🔄 Ponów
                  </button>
                  <button
                    onClick={() => handleEdit(invite)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    ✏ Edytuj
                  </button>
                  <button
                    onClick={() => {
                      setSelectedInvitation(invite);
                      setShowDeleteModal(true);
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    🗑 Usuń
                  </button>
                </td>
              </tr>
            ))}
            {invitations.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Brak zaproszeń w bazie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal potwierdzenia usunięcia */}
      {showDeleteModal && selectedInvitation && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedInvitation(null);
          }}
        />
      )}

      {/* Modal edycji */}
      {showEditModal && selectedInvitation && (
        <EditInvitationModal
          invitation={selectedInvitation}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInvitation(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default InvitationsPage;
