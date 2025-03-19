import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Jeśli aktualna ścieżka zaczyna się od /test, TopBar nie jest wyświetlany
  const isTestPage = location.pathname.startsWith("/test");

  if (isTestPage) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        BHP-System
      </Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/admin" className="hover:underline">
              Panel główny
            </Link>
            <Link to="/questions" className="hover:underline">
              Pytania
            </Link>
            <Link to="/invitations" className="hover:underline">
              Zaproszenia
            </Link>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
              Wyloguj
            </button>
          </>
        ) : (
          <Link to="/" className="hover:underline">
            Zweryfikuj dostęp
          </Link>
        )}
      </div>
    </nav>
  );
};

export default TopBar;
