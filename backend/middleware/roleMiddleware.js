const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Brak uprawnień. Tylko administratorzy mają dostęp." });
  }
};

module.exports = checkAdmin;
