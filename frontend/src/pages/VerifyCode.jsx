// src/pages/VerifyCode.jsx
import { useState } from "react";
import { verifyAccessCode } from "../api";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);

  const handleVerify = async () => {
    const data = await verifyAccessCode(code);
    setMessage(data.error || data.message);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Weryfikacja kodu dostępu</h2>
      <input
        className="p-2 border"
        type="text"
        placeholder="Wpisz kod"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-2"
        onClick={handleVerify}
      >
        Sprawdź kod
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default VerifyCode;
