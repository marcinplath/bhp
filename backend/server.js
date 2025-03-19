const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // 🔹 Dostosuj do frontendu
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // ✅ Dodajemy obsługę ciasteczek

// Routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
};

startServer();
