import { useState } from "react";

const EditInvitationModal = ({ invitation, onClose, onSave }) => {
  const [email, setEmail] = useState(invitation.email);
  const [expiresAt, setExpiresAt] = useState(
    invitation.expires_at
      ? new Date(invitation.expires_at).toISOString().slice(0, 16)
      : ""
  );

  const handleSave = () => {
    onSave({ email, expires_at: new Date(expiresAt).toISOString() });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Edytuj zaproszenie</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border w-full mb-2"
        />
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="p-2 border w-full"
        />
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Zapisz
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvitationModal;
