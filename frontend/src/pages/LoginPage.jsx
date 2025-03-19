import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate("/admin");
    } else {
      setError("Nieprawidłowy email lub hasło.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Logowanie</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        className="p-2 border w-80"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="p-2 border w-80 mt-2"
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logowanie..." : "Zaloguj"}
      </button>
    </div>
  );
};

export default LoginPage;
