import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const SessionModal = () => {
  const { showSessionModal, stayLoggedIn, logout, logoutAt } = useAuth();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let intervalId;

    if (showSessionModal && logoutAt) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeLeftMs = logoutAt - now;
        setCountdown(Math.max(0, Math.floor(timeLeftMs / 1000)));
      };

      updateCountdown();

      intervalId = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showSessionModal, logoutAt]);

  if (!showSessionModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Twoja sesja wkrótce wygaśnie</h2>
        <p className="mb-4">
          Masz jeszcze <span className="font-bold">{countdown}</span> sek. na
          podjęcie decyzji. Czy chcesz pozostać zalogowany?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => logout()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Wyloguj
          </button>
          <button
            onClick={() => stayLoggedIn()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Pozostań zalogowany
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
