const jwt = require('jsonwebtoken');
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Received Token on Server:", token); // ✅ Проверяем, пришел ли токен

    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) return res.status(404).json({ message: "User not found" });

        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};


const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied, admin only" });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
