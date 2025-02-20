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

        const allowedCategories = ["Breakfast", "Lunch", "Dinner", "Dessert", "Drinks"]; // Разрешенные категории
        if (!allowedCategories.includes(category.trim())) {
            return res.status(400).json({ message: "Недопустимая категория" });
        }

        const existingRecipe = await Recipe.findOne({ title: title.trim() });
        if (existingRecipe) {
            return res.status(400).json({ message: "Рецепт с таким названием уже существует" });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

        const newRecipe = new Recipe({
            title: title.trim(),
            ingredients: ingredients.split(',').map(i => i.trim()), // Убираем пробелы у ингредиентов
            instructions: instructions.trim(),
            category: category.trim(),
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
        const { category, search, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: "i" }; // Поиск по названию (регистронезависимый)

        const recipes = await Recipe.find(filter)
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) // Пропуск страниц
            .limit(parseInt(limit));

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

        if (req.body.title) {
            const existingRecipe = await Recipe.findOne({ title: req.body.title.trim() });
            if (existingRecipe && existingRecipe._id.toString() !== recipe._id.toString()) {
                return res.status(400).json({ message: "Рецепт с таким названием уже существует" });
            }
            recipe.title = req.body.title.trim();
        }

        if (req.body.ingredients) recipe.ingredients = req.body.ingredients.split(",").map(i => i.trim());
        if (req.body.instructions) recipe.instructions = req.body.instructions.trim();
        if (req.body.category) recipe.category = req.body.category.trim();

        if (req.file) {
            if (recipe.image) {
                const oldImagePath = path.join(__dirname, "..", recipe.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
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
        const categories = await Recipe.distinct("category", { category: { $ne: "" } }); // Убираем пустые значения
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении категорий" });
    }
};


// 📌 **Агрегация - количество рецептов по категориям**
exports.getRecipeStatistics = async (req, res) => {
    try {
        const { days } = req.query;
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - (days ? parseInt(days) : 30));

        const stats = await Recipe.aggregate([
            { $match: { category: { $ne: "" }, createdAt: { $gte: filterDate } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const totalRecipes = await Recipe.countDocuments(); // Общее количество рецептов

        res.json({ totalRecipes, stats });
    } catch (error) {
        res.status(500).json({ message: "Ошибка при получении статистики" });
    }
};

