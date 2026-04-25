const express = require('express');
const cors = require('cors');
const allCards = require('./cards'); // Подключаем наш новый файл с картами!

const app = express();
app.use(cors());
app.use(express.json());

const database = {};

// Отдаем сайту профиль игрока
app.post('/api/login', (req, res) => {
    const { telegram_id } = req.body;
    if (!database[telegram_id]) {
        database[telegram_id] = { coins: 200, inventory: [] };
    }
    res.json(database[telegram_id]);
});

// Отдаем сайту справочник вообще всех карт, которые существуют в игре
app.get('/api/cards', (req, res) => {
    res.json(allCards);
});

// Открытие пака
app.post('/api/open_pack', (req, res) => {
    const { telegram_id } = req.body;
    const user = database[telegram_id];

    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    if (user.coins < 50) return res.status(400).json({ error: "Недостаточно монет" });

    user.coins -= 50;
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    user.inventory.push(randomCard);

    res.json({ success: true, coins: user.coins, newCard: randomCard });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
