const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const pool = require("../database/db");
const router = express.Router();
const { sendCompletionEmail } = require("../utils/emailSender");
const checkAdmin = require("../middleware/roleMiddleware");

router.get("/admin-panel", authenticateToken, checkAdmin, (req, res) => {
  res.status(200).json({ message: "Witaj w panelu administratora!" });
});

router.get("/test/:link", async (req, res) => {
  const { link } = req.params;

  try {
    const invitation = await pool.query(
      `
            SELECT * FROM invitations 
            WHERE link = $1 AND status = 'pending' AND expires_at > NOW()
        `,
      [link]
    );

    if (!invitation.rows.length) {
      return res
        .status(404)
        .json({ error: "Podany link do testu nie istnieje lub wygasł." });
    }

    const questions = await pool.query(`
            SELECT 
                id, 
                question_text, 
                option_a, 
                option_b, 
                option_c 
            FROM questions
            ORDER BY RANDOM()
        `);

    res.status(200).json({ test: questions.rows });
  } catch (error) {
    if (error.code === "22P02") {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy format linku testu." });
    }
    console.error("Błąd pobierania testu:", error);
    res
      .status(500)
      .json({ error: "Wewnętrzny błąd serwera. Spróbuj ponownie później." });
  }
});

router.post("/test/:link/submit", async (req, res) => {
  const { link } = req.params;
  const { answers } = req.body;

  try {
    const invitation = await pool.query(
      `
        SELECT id, email FROM invitations 
        WHERE link = $1 AND status = 'pending'
      `,
      [link]
    );

    if (!invitation.rows.length) {
      return res.status(403).json({ error: "Nieprawidłowe przesłanie testu" });
    }

    const invitationId = invitation.rows[0].id;
    const guestEmail = invitation.rows[0].email;

    const questionsResult = await pool.query(`
        SELECT id, correct_option
        FROM questions
      `);
    const questions = questionsResult.rows;
    const totalQuestions = questions.length;

    if (!answers || answers.length < totalQuestions) {
      return res.status(400).json({
        error: "Nie odpowiedziano na wszystkie pytania w teście.",
      });
    }

    let incorrectQuestions = [];
    let score = 0;

    const correctMap = {};
    questions.forEach((q) => {
      correctMap[q.id] = q.correct_option;
    });

    answers.forEach((userAnswer) => {
      if (!correctMap[userAnswer.questionId]) {
        incorrectQuestions.push(userAnswer.questionId);
      } else if (
        correctMap[userAnswer.questionId] === userAnswer.selectedOption
      ) {
        score++;
      } else {
        incorrectQuestions.push(userAnswer.questionId);
      }
    });

    if (incorrectQuestions.length > 0) {
      return res.status(200).json({
        message: "Test niezaliczony. Popraw błędne odpowiedzi.",
        incorrectQuestions,
      });
    }

    const accessCode = generateAccessCode();
    await pool.query(
      `
        UPDATE invitations SET status = 'completed', access_code = $1 
        WHERE id = $2
      `,
      [accessCode, invitationId]
    );

    await sendCompletionEmail(guestEmail, accessCode);

    res.status(200).json({
      message: "Test zaliczony! Kod dostępu został wysłany na e-mail.",
      accessCode,
    });
  } catch (error) {
    console.error("Błąd przesyłania odpowiedzi:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

const generateAccessCode = () => {
  return `BHP-${Math.floor(100000 + Math.random() * 900000)}`;
};

router.get("/verify-access/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      `
            SELECT email, status FROM invitations WHERE access_code = $1
        `,
      [code]
    );

    if (!result.rows.length) {
      return res
        .status(404)
        .json({ error: "Kod nieprawidłowy lub nie istnieje." });
    }

    if (result.rows[0].status !== "completed") {
      return res
        .status(403)
        .json({ error: "Test niezaliczony. Gość nie ma dostępu." });
    }

    res.status(200).json({ message: "Kod poprawny! Gość ma dostęp." });
  } catch (error) {
    console.error("Błąd weryfikacji kodu:", error);
    res.status(500).json({ error: "Błąd serwera, spróbuj ponownie później." });
  }
});

module.exports = router;
