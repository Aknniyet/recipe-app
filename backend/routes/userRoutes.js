const express = require("express");
const userController = require("../controllers/userController"); // ✅ Импортируем как объект
const authMiddleware = require("../middleware/authMiddleware").authMiddleware;


const router = express.Router();

// Добавление/удаление избранного
router.post("/favorites", authMiddleware, userController.toggleFavorite);
router.get("/favorites", authMiddleware, userController.getFavorites);

// Добавление/удаление лайка
router.post("/likes", authMiddleware, userController.toggleLike);

module.exports = router; // ✅ Правильный экспорт маршрута
