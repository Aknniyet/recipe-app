const User = require("../models/User");
const Recipe = require("../models/Recipe");

// 📌 **Добавить/удалить из избранного**
exports.toggleFavorite = async (req, res) => {
    try {
        const { recipeId } = req.body;
        if (!recipeId) return res.status(400).json({ message: "Recipe ID is required" });

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) return res.status(404).json({ message: "Recipe not found" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.favorites.indexOf(recipeId);
        if (index === -1) {
            user.favorites.push(recipeId);
        } else {
            user.favorites.splice(index, 1);
        }

        await user.save();
        res.json({ favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// 📌 **Получить избранные рецепты пользователя**
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("favorites");
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: "Ошибка получения избранных", error });
    }
};

// 📌 **Добавить/удалить лайк**
exports.toggleLike = async (req, res) => {
    try {
        const { recipeId } = req.body; // ✅ Теперь используется req.body вместо req.params
        if (!recipeId) return res.status(400).json({ message: "Recipe ID is required" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.likes.indexOf(recipeId);
        if (index === -1) {
            user.likes.push(recipeId);
        } else {
            user.likes.splice(index, 1);
        }

        await user.save();
        res.json({ message: "Likes updated", likes: user.likes });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
