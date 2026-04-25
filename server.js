const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Разрешаем твоему сайту на GitHub общаться с этим сервером
app.use(express.json());

// Временная база данных (хранится, пока работает сервер)
const database = {};

// Список всех карточек в игре
const allCards = [
    { id: 1, name: "Наруто Узумаки", rarity: "Обычная", emoji: "🍜" },
    { id: 2, name: "Сатору Годжо", rarity: "Редкая", emoji: "🤞" },
    { id: 3, name: "Леви Аккерман", rarity: "Легендарная", emoji: "⚔️" }
];

// Функция: Игрок заходит в приложение
app.post('/api/login', (req, res) => {
    const { telegram_id } = req.body;
    
    // Если игрока нет в базе, создаем ему профиль
    if (!database[telegram_id]) {
        database[telegram_id] = { coins: 200, inventory: [] };
    }
    
    // Отправляем данные игрока
    res.json(database[telegram_id]);
});

// Функция: Открытие пака с карточками
app.post('/api/open_pack', (req, res) => {
    const { telegram_id } = req.body;
    const user = database[telegram_id];

    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    if (user.coins < 50) return res.status(400).json({ error: "Недостаточно монет" });

    // Списываем монеты
    user.coins -= 50;

    // Выбираем случайную карточку
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    
    // Добавляем в инвентарь
    user.inventory.push(randomCard);

    // Отвечаем сайту новыми данными
    res.json({ success: true, coins: user.coins, newCard: randomCard });
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
