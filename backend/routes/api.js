const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const pool = require("../database/db");
const router = express.Router();
const { sendCompletionEmail } = require("../utils/emailSender");
const checkAdmin = require("../middleware/roleMiddleware");

// Endpoint chroniony tylko dla administratorów:
router.get("/admin-panel", authenticateToken, checkAdmin, (req, res) => {
  res.status(200).json({ message: "Witaj w panelu administratora!" });
});

router.get("/test/:link", async (req, res) => {
  const { link } = req.params;

  try {
    // 🔹 Sprawdzenie, czy zaproszenie istnieje i jest nadal aktywne
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

    // Pobranie pytań do testu
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
      // Błąd PostgreSQL dla złego UUID
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

// Przesyłanie odpowiedzi na test
// router.post("/test/:link/submit", async (req, res) => {
//     const { link } = req.params;
//     const { answers } = req.body;

//     try {
//         // Pobranie zaproszenia
//         const invitation = await pool.query(`
//             SELECT id, email FROM invitations
//             WHERE link = $1 AND status = 'pending'
//         `, [link]);

//         if (!invitation.rows.length) {
//             return res.status(403).json({ error: "Nieprawidłowe przesłanie testu" });
//         }

//         const invitationId = invitation.rows[0].id;
//         const guestEmail = invitation.rows[0].email;

//         // Pobranie poprawnych odpowiedzi
//         const correctAnswers = await pool.query(`
//             SELECT id, correct_option
//             FROM questions
//         `);

//         let score = 0;
//         let incorrectQuestions = [];

//         answers.forEach((userAnswer) => {
//             const correct = correctAnswers.rows.find(q => q.id === userAnswer.questionId);
//             if (correct?.correct_option === userAnswer.selectedOption) {
//                 score++;
//             } else {
//                 incorrectQuestions.push(userAnswer.questionId);
//             }
//         });

//         // Jeśli są błędne odpowiedzi, zwracamy je do poprawy
//         if (incorrectQuestions.length > 0) {
//             return res.status(200).json({
//                 message: "Test niezaliczony. Popraw błędne odpowiedzi.",
//                 incorrectQuestions
//             });
//         }

//         // Generowanie kodu dostępu po zaliczeniu testu
//         const accessCode = generateAccessCode();

//         // Aktualizacja zaproszenia w bazie (zmiana statusu + zapisanie kodu dostępu)
//         await pool.query(`
//             UPDATE invitations SET status = 'completed', access_code = $1 WHERE id = $2
//         `, [accessCode, invitationId]);

//         // Wysłanie e-maila do gościa z kodem dostępu
//         await sendCompletionEmail(guestEmail, accessCode);

//         res.status(200).json({
//             message: "Test zaliczony! Kod dostępu został wysłany na e-mail.",
//             accessCode
//         });

//     } catch (error) {
//         console.error("Błąd przesyłania odpowiedzi:", error);
//         res.status(500).json({ error: "Błąd serwera" });
//     }
// });

router.post("/test/:link/submit", async (req, res) => {
  const { link } = req.params;
  const { answers } = req.body;

  try {
    // 1. Sprawdzenie zaproszenia
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

    // 2. Pobranie wszystkich pytań (z poprawnymi odpowiedziami)
    const questionsResult = await pool.query(`
        SELECT id, correct_option
        FROM questions
      `);
    const questions = questionsResult.rows; // Wszystkie pytania w bazie
    const totalQuestions = questions.length; // Liczba wszystkich pytań

    // 3. Sprawdzamy, czy użytkownik udzielił odpowiedzi na wszystkie pytania
    //    (możesz to zrobić na kilka sposobów – tu najprostsze porównanie liczby)
    if (!answers || answers.length < totalQuestions) {
      return res.status(400).json({
        error: "Nie odpowiedziano na wszystkie pytania w teście.",
      });
    }

    // 4. Weryfikujemy odpowiedzi
    let incorrectQuestions = [];
    let score = 0;

    // Tworzymy obiekt/dictionary dla szybkiego wyszukiwania poprawnych odpowiedzi
    const correctMap = {};
    questions.forEach((q) => {
      correctMap[q.id] = q.correct_option;
    });

    answers.forEach((userAnswer) => {
      // Sprawdzamy czy dana odpowiedź pasuje do klucza
      if (!correctMap[userAnswer.questionId]) {
        // Taki questionId nie istnieje – błąd lub ignorujemy
        incorrectQuestions.push(userAnswer.questionId);
      } else if (
        correctMap[userAnswer.questionId] === userAnswer.selectedOption
      ) {
        score++;
      } else {
        incorrectQuestions.push(userAnswer.questionId);
      }
    });

    // 5. Jeśli są błędne odpowiedzi, zwracamy je do poprawy
    if (incorrectQuestions.length > 0) {
      return res.status(200).json({
        message: "Test niezaliczony. Popraw błędne odpowiedzi.",
        incorrectQuestions,
      });
    }

    // 6. Test zaliczony → Generowanie kodu dostępu i aktualizacja zaproszenia
    const accessCode = generateAccessCode();
    await pool.query(
      `
        UPDATE invitations SET status = 'completed', access_code = $1 
        WHERE id = $2
      `,
      [accessCode, invitationId]
    );

    // Wysłanie e-maila z kodem dostępu
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
  return `BHP-${Math.floor(100000 + Math.random() * 900000)}`; // Losowy kod 6-cyfrowy
};

router.get("/verify-access/:code", async (req, res) => {
  const { code } = req.params;

  try {
    // Sprawdzenie, czy kod istnieje w bazie
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
