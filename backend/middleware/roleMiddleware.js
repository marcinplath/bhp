const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // Jeśli rola to admin, przejdź dalej
    } else {
        res.status(403).json({ error: "Brak uprawnień. Tylko administratorzy mają dostęp." });
    }
};

module.exports = checkAdmin;
