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
        const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
        if (!recipe) return res.status(404).json({ message: 'Рецепт не найден' });

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при поиске рецепта' });
    }
};

// Обновление рецепта
exports.updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Рецепт не найден' });

        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет доступа' });
        }

        Object.assign(recipe, req.body);
        await recipe.save();
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении рецепта' });
    }
};

// Удаление рецепта и изображения
exports.deleteRecipe = async (req, res) => {
    try {
        const recipeId = req.params.id;

        // Находим рецепт
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Рецепт не найден' });
        }

        // Проверяем авторизацию пользователя
        if (!req.user || !req.user.id) {
            console.error('Ошибка авторизации: req.user отсутствует.');
            return res.status(403).json({ message: 'Ошибка авторизации: Нет доступа' });
        }

        console.log(`Пользователь: ${req.user.id}, Владелец рецепта: ${recipe.createdBy.toString()}`);

        // Сравниваем ID пользователя и владельца рецепта
        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет доступа' });
        }

        // Удаляем изображение, если оно есть
        if (recipe.image) {
            const imagePath = path.join(__dirname, '..', recipe.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Удаляем сам рецепт
        await Recipe.deleteOne({ _id: recipeId });

        return res.json({ message: 'Рецепт успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении рецепта:', error);
        return res.status(500).json({ message: 'Ошибка при удалении рецепта' });
    }
};
