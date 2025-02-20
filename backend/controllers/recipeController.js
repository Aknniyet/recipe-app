const Recipe = require('../models/Recipe');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройки multer для загрузки изображений
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Сохраняем с правильным расширением
    }
});

const upload = multer({ storage });

exports.upload = upload.single('image'); // Middleware для загрузки изображений

// Создание рецепта с изображением
exports.createRecipe = async (req, res) => {
    try {
        const { title, ingredients, instructions } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Проверяем, есть ли изображение

        const newRecipe = new Recipe({
            title,
            ingredients: ingredients.split(','), // Преобразуем строку в массив
            instructions,
            image: imagePath, // Сохраняем путь к изображению
            createdBy: req.user.id
        });

        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании рецепта' });
    }
};

// Получение всех рецептов
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('createdBy', 'username');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении рецептов' });
    }
};

// Получение рецепта по ID
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username _id');
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recipe" });
    }
};

// Обновление рецепта с изображением
exports.updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        console.log("Пришли данные на обновление:", req.body);

        // Обновление данных рецепта
        recipe.title = req.body.title || recipe.title;
        recipe.ingredients = req.body.ingredients ? req.body.ingredients.split(",") : recipe.ingredients;
        recipe.instructions = req.body.instructions || recipe.instructions;

        // Если новое изображение загружено
        if (req.file) {
            recipe.image = `/uploads/${req.file.filename}`;
        }

        await recipe.save();
        res.json({ message: "Recipe updated successfully!", recipe });
    } catch (error) {
        console.error("Ошибка при обновлении рецепта:", error);
        res.status(500).json({ message: "Ошибка при обновлении рецепта" });
    }
};


// Удаление рецепта и изображения
exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Рецепт не найден' });
        }

        // Проверка на авторизацию
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: 'Ошибка авторизации: Нет доступа' });
        }

        // Проверяем, является ли пользователь владельцем или админом
        if (recipe.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }

        // Удаляем изображение, если оно есть
        if (recipe.image) {
            const imagePath = path.join(__dirname, '..', recipe.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Recipe.deleteOne({ _id: req.params.id });

        return res.json({ message: 'Рецепт успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении рецепта:', error);
        return res.status(500).json({ message: 'Ошибка при удалении рецепта' });
    }
};
