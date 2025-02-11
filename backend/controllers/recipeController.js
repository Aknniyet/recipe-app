const Recipe = require('../models/Recipe');

exports.createRecipe = async (req, res) => {
    try {
        const { title, ingredients, instructions } = req.body;
        const newRecipe = new Recipe({ title, ingredients, instructions, createdBy: req.user.id });

        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании рецепта' });
    }
};

exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('createdBy', 'username');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении рецептов' });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'username');
        if (!recipe) return res.status(404).json({ message: 'Рецепт не найден' });

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при поиске рецепта' });
    }
};

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

exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Рецепт не найден' });

        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Нет доступа' });
        }

        await recipe.deleteOne();
        res.json({ message: 'Рецепт удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении рецепта' });
    }
};
