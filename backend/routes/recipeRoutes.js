const express = require('express');
const path = require('path');
const { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe } = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
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

router.post('/', authMiddleware, upload.single('image'), createRecipe);
router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.put("/:id", authMiddleware, upload.single("image"), updateRecipe);

// Исправленный маршрут для удаления рецепта
router.delete('/:id', authMiddleware, deleteRecipe);

module.exports = router;
