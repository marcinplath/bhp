const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");
const pool = require("../database/db");
const {
  sendInvitationEmail,
  sendCompletionEmail,
} = require("../utils/emailSender");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post(
  "/send-invitation",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { email, inviter } = req.body;

    if (!email || !inviter) {
      return res
        .status(400)
        .json({ error: "Proszę podać email gościa i zapraszającego." });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format adresu e-mail." });
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      console.log(`Tworzenie zaproszenia dla: ${email}, od: ${inviter}`);

      const result = await pool.query(
        "INSERT INTO invitations (email, inviter, expires_at) VALUES ($1, $2, $3) RETURNING *",
        [email, inviter, expiresAt]
      );

      const invitation = result.rows[0];
      const link = `http://localhost:5173/test/${invitation.link}`;

      console.log(`Wysłanie e-maila z linkiem: ${link}`);

      await sendInvitationEmail(email, link);

      res
        .status(201)
        .json({ message: "Zaproszenie zostało wysłane", invitation });
    } catch (error) {
      console.error("Błąd podczas wysyłania zaproszenia:", error);
      res.status(500).json({ error: "Błąd serwera" });
    }
  }
);

router.post(
  "/resend-invitation/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format ID zaproszenia." });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM invitations WHERE id = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Zaproszenie nie istnieje." });
      }

      const invitation = result.rows[0];

      if (invitation.status === "pending") {
        const link = `http://localhost:5173/test/${invitation.link}`;
        await sendInvitationEmail(invitation.email, link);
        return res
          .status(200)
          .json({ message: "Zaproszenie zostało ponownie wysłane." });
      }

      if (invitation.status === "completed") {
        if (!invitation.access_code) {
          return res
            .status(400)
            .json({ error: "Brak przypisanego kodu dostępu." });
        }

        await sendCompletionEmail(invitation.email, invitation.access_code);
        return res
          .status(200)
          .json({ message: "E-mail z kodem dostępu został ponownie wysłany." });
      }

      return res
        .status(400)
        .json({ error: "Nieobsługiwany status zaproszenia." });
    } catch (error) {
      console.error("Błąd podczas ponownego wysyłania zaproszenia:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

router.get("/invitations", authenticateToken, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM invitations ORDER BY created_at DESC"
    );
    res.status(200).json({ invitations: result.rows });
  } catch (error) {
    console.error("Błąd podczas pobierania zaproszeń:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

router.put(
  "/invitations/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { email, expires_at } = req.body;

    if (email && !isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format adresu e-mail." });
    }

    if (expires_at && new Date(expires_at) < new Date()) {
      return res
        .status(400)
        .json({ error: "Data wygaśnięcia musi być w przyszłości." });
    }

    try {
      const existingInvitation = await pool.query(
        "SELECT * FROM invitations WHERE id = $1",
        [id]
      );

      if (existingInvitation.rowCount === 0) {
        return res.status(404).json({ error: "Zaproszenie nie istnieje." });
      }

      const updatedEmail = email || existingInvitation.rows[0].email;
      const updatedExpiresAt =
        expires_at || existingInvitation.rows[0].expires_at;

      await pool.query(
        "UPDATE invitations SET email = $1, expires_at = $2 WHERE id = $3 RETURNING *",
        [updatedEmail, updatedExpiresAt, id]
      );

      res.status(200).json({ message: "Zaproszenie zostało zaktualizowane." });
    } catch (error) {
      console.error("Błąd podczas edytowania zaproszenia:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

router.delete(
  "/invitations/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM invitations WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Zaproszenie nie istnieje." });
      }

      res.status(200).json({ message: "Zaproszenie zostało usunięte." });
    } catch (error) {
      console.error("Błąd podczas usuwania zaproszenia:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

router.get("/questions", authenticateToken, checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM questions ORDER BY id ASC");
    res.status(200).json({ questions: result.rows });
  } catch (error) {
    console.error("Błąd pobierania pytań:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.post("/questions", authenticateToken, checkAdmin, async (req, res) => {
  const { question_text, option_a, option_b, option_c, correct_option } =
    req.body;

  if (
    !question_text ||
    !option_a ||
    !option_b ||
    !option_c ||
    !correct_option
  ) {
    return res.status(400).json({ error: "Wszystkie pola są wymagane." });
  }

  if (!["A", "B", "C"].includes(correct_option)) {
    return res.status(400).json({
      error: "Poprawna odpowiedź musi być jedną z wartości: A, B lub C.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO questions (question_text, option_a, option_b, option_c, correct_option) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [question_text, option_a, option_b, option_c, correct_option]
    );

    res
      .status(201)
      .json({ message: "Pytanie zostało dodane.", question: result.rows[0] });
  } catch (error) {
    console.error("Błąd dodawania pytania:", error);
    res.status(500).json({ error: "Błąd serwera." });
  }
});

router.put(
  "/questions/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { question_text, option_a, option_b, option_c, correct_option } =
      req.body;

    if (
      !question_text ||
      !option_a ||
      !option_b ||
      !option_c ||
      !correct_option
    ) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }

    if (!["A", "B", "C"].includes(correct_option)) {
      return res.status(400).json({
        error: "Poprawna odpowiedź musi być jedną z wartości: A, B lub C.",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE questions 
            SET question_text = $1, option_a = $2, option_b = $3, option_c = $4, correct_option = $5
            WHERE id = $6 RETURNING *`,
        [question_text, option_a, option_b, option_c, correct_option, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Pytanie nie istnieje." });
      }

      res.status(200).json({
        message: "Pytanie zostało zaktualizowane.",
        question: result.rows[0],
      });
    } catch (error) {
      console.error("Błąd edytowania pytania:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);
router.delete(
  "/questions/:id",
  authenticateToken,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM questions WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Pytanie nie istnieje." });
      }

      res.status(200).json({ message: "Pytanie zostało usunięte." });
    } catch (error) {
      console.error("Błąd usuwania pytania:", error);
      res.status(500).json({ error: "Błąd serwera." });
    }
  }
);

module.exports = router;
