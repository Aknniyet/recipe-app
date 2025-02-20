const express = require('express');
const path = require('path');
const { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe } = require('../controllers/recipeController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware'); // Убеждаемся, что adminMiddleware импортирован
const multer = require('multer');

const router = express.Router();

// Настройка загрузки изображений
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Роуты
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createRecipe); // Теперь только админ может создать рецепт
router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateRecipe); // Теперь только админ может редактировать
router.delete("/:id", authMiddleware, adminMiddleware, deleteRecipe); // Удаление доступно только админу

router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const recipes = await Recipe.find(filter);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Ошибка получения рецептов" });
    }
});



module.exports = router;
