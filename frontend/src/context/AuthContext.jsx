import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { jwtDecode } from "jwt-decode";
import { fetchUserData, loginUser, logoutUser } from "../api/auth";
import api from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [logoutAt, setLogoutAt] = useState(null);
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      setupSessionTimers(accessToken);
    } else {
      delete api.defaults.headers.common.Authorization;
      clearSessionTimers();
      setLogoutAt(null);
    }
  }, [accessToken]);

  useEffect(() => {
    window.updateAccessToken = (newToken) => {
      setAccessToken(newToken);
    };
    return () => {
      delete window.updateAccessToken;
    };
  }, []);

  const loadUser = async () => {
    try {
      const userData = await fetchUserData();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const token = await loginUser(email, password);
    if (token) {
      setAccessToken(token);
      await loadUser();
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setAccessToken(null);
    setUser(null);
    setShowSessionModal(false);
    setLogoutAt(null);
  };

  const setupSessionTimers = (token) => {
    clearSessionTimers();
    try {
      const decoded = jwtDecode(token);
      const expiryTimeMs = decoded.exp * 1000;
      const now = Date.now();
      const timeLeft = expiryTimeMs - now;

      if (timeLeft <= 0) {
        logout();
        return;
      }

      setLogoutAt(expiryTimeMs);

      const warningTime = 60 * 1000;
      const showModalAt = timeLeft - warningTime;

      if (showModalAt <= 0) {
        setShowSessionModal(true);
      } else {
        warningTimerRef.current = setTimeout(() => {
          setShowSessionModal(true);
        }, showModalAt);
      }

      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, timeLeft);
    } catch (err) {
      console.error("Błąd dekodowania tokena:", err);
      logout();
    }
  };

  const clearSessionTimers = () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  };

  const stayLoggedIn = async () => {
    setShowSessionModal(false);
    try {
      const response = await api.post("/auth/refresh-token");
      if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        logout,
        showSessionModal,
        stayLoggedIn,
        logoutAt,
      }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-screen text-lg">
          Ładowanie...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
