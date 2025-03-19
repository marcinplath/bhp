const pool = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Proszę podać email i hasło" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, "user"]
    );

    res
      .status(201)
      .json({ message: "Użytkownik zarejestrowany!", user: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      // Duplikat email
      res.status(400).json({ error: "Użytkownik z tym emailem już istnieje" });
    } else {
      res.status(500).json({ error: "Błąd serwera" });
    }
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Nieprawidłowe hasło" });
    }

    // ✅ Sprawdzenie, czy użytkownik już ma refresh token w bazie
    const tokenCheck = await pool.query(
      "SELECT * FROM refresh_tokens WHERE user_id = $1",
      [user.id]
    );
    if (tokenCheck.rows.length > 0) {
      return res.status(400).json({
        error: "Użytkownik jest już zalogowany. Najpierw się wyloguj.",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );

    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Zapisanie refresh tokena w bazie danych
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
      [user.id, refreshToken]
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Błąd podczas logowania:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

module.exports = { registerUser, loginUser };
