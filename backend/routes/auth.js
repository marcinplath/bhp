const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const pool = require("../database/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Pobieranie danych zalogowanego użytkownika
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Pobieramy ID użytkownika z tokena
    const userResult = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });
    }

    const user = userResult.rows[0];
    res.json(user); // Zwracamy dane użytkownika
  } catch (error) {
    console.error("Błąd pobierania danych użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpoint rejestracji
router.post("/register", registerUser);

// Endpoint logowania
router.post("/login", loginUser);

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Brak refresh tokena" });
  }

  try {
    const tokenRecord = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [refreshToken]
    );

    if (tokenRecord.rows.length === 0) {
      return res.status(403).json({ error: "Refresh token nieznaleziony" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Refresh token wygasł" });

        // Pobierz dane użytkownika
        const userResult = await pool.query(
          "SELECT id, email, role FROM users WHERE id = $1",
          [decoded.id]
        );

        if (userResult.rows.length === 0) {
          return res.status(403).json({ error: "Użytkownik nie istnieje" });
        }

        const user = userResult.rows[0];

        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "2m" }
        );

        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error("Błąd podczas odświeżania tokenu:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(204).send(); // Nic do usunięcia
  }

  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [
      refreshToken,
    ]);

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Wylogowano pomyślnie" });
  } catch (error) {
    console.error("Błąd podczas wylogowywania:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;
