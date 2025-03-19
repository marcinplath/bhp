import React from "react";
import { useAuth } from "../context/AuthContext";

const AdminPanel = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Panel Administracyjny</h1>
      <p className="text-lg mb-2">
        Witaj,{" "}
        <span className="font-semibold">
          {user ? user.email : "nieznany użytkownik"}
        </span>
        !
      </p>
      <p className="text-md text-gray-700">
        To jest system BHP, który umożliwia zarządzanie testami BHP,
        zaproszeniami oraz pytaniami. Korzystając z tego systemu masz możliwość:
      </p>
      <ul className="list-disc list-inside mt-4 text-gray-700">
        <li>Tworzenia i zarządzania zaproszeniami na testy</li>
        <li>Dodawania, edycji i usuwania pytań testowych</li>
        <li>Przeglądania wyników testów</li>
      </ul>
    </div>
  );
};

export default AdminPanel;
