const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

dotenv.config({ path: './backend/.env' });
const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Даем доступ к файлам изображений
app.use('/uploads', express.static('uploads'));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Запуск сервера
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
