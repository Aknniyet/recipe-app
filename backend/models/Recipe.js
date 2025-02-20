const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    instructions: { type: String, required: true },
    image: { type: String },
    category: { type: String, required: true, index: true }, // Индекс для быстрого поиска по категориям
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

RecipeSchema.index({ title: "text", category: 1 }); // Композитный индекс

module.exports = mongoose.model("Recipe", RecipeSchema);
