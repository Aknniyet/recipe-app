const Recipe = require('../models/Recipe');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройки multer для загрузки изображений
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });
exports.upload = upload.single('image'); // Middleware для загрузки изображений

// 📌 **Создание рецепта с категорией**
exports.createRecipe = async (req, res) => {
    try {
        const { title, ingredients, instructions, category } = req.body;
        if (!title || !ingredients || !instructions || !category) {
            return res.status(400).json({ message: "Все поля обязательны" });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const newRecipe = new Recipe({
            title,
            ingredients: ingredients.split(','),
            instructions,
            category, // Добавлена категория
            image: imagePath,
            createdBy: req.user.id
        });

        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка при создании рецепта" });
    }
};

// 📌 **Получение всех рецептов с фильтрацией по категории**
exports.getRecipes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const recipes = await Recipe.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 }) // Сортировка по дате (новые вверху)
            .limit(50) // Ограничение на 50 рецептов

        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении рецептов" });
    }
};

// 📌 **Оптимизированное получение одного рецепта по ID**
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'username _id');

        if (!recipe) return res.status(404).json({ message: "Рецепт не найден" });

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении рецепта" });
    }
};

// 📌 **Обновление рецепта с категорией**
exports.updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Рецепт не найден" });

        if (recipe.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        recipe.title = req.body.title || recipe.title;
        recipe.ingredients = req.body.ingredients ? req.body.ingredients.split(",") : recipe.ingredients;
        recipe.instructions = req.body.instructions || recipe.instructions;
        recipe.category = req.body.category || recipe.category;

        if (req.file) {
            recipe.image = `/uploads/${req.file.filename}`;
        }

        await recipe.save();
        res.json({ message: "Рецепт успешно обновлен!", recipe });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при обновлении рецепта" });
    }
};

// 📌 **Удаление рецепта**
exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Рецепт не найден" });

        if (recipe.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        if (recipe.image) {
            const imagePath = path.join(__dirname, "..", recipe.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Recipe.deleteOne({ _id: req.params.id });

        return res.json({ message: "Рецепт успешно удален" });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при удалении рецепта" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Recipe.distinct("category"); // Получаем список уникальных категорий
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении категорий" });
    }
};



// 📌 **Агрегация - количество рецептов по категориям**
exports.getRecipeStatistics = async (req, res) => {
    try {
        const stats = await Recipe.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } } // Сортировка по количеству
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении статистики" });
    }
};
