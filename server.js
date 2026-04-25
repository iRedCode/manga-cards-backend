const express = require('express');
const cors = require('cors');
const allCards = require('./cards');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const database = {};

// Логин: теперь выдаем 1000 монет и создаем пустые поля для профиля
app.post('/api/login', (req, res) => {
    const { telegram_id } = req.body;
    if (!database[telegram_id]) {
        database[telegram_id] = { 
            coins: 1000, 
            inventory: [], 
            avatar: null,      // Ссылка на картинку аватара
            bestCards: []      // Массив любимых карт (максимум 3)
        };
    }
    res.json(database[telegram_id]);
});

app.get('/api/cards', (req, res) => { res.json(allCards); });

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

app.post('/api/create_card', (req, res) => {
    const { name, anime, rank, image } = req.body;
    const newCard = { id: allCards.length + 1, name: name || "Неизвестный", anime: anime || "Неизвестно", rank: rank || "E", image: image };
    allCards.push(newCard);
    res.json({ success: true, card: newCard });
});

// НОВЫЙ МАРШРУТ: Обновление профиля (Аватар или Любимые карты)
app.post('/api/update_profile', (req, res) => {
    const { telegram_id, action, payload } = req.body;
    const user = database[telegram_id];
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    if (action === 'set_avatar') {
        user.avatar = payload; // payload - это ссылка на картинку
    } else if (action === 'add_best') {
        // Проверяем, нет ли уже этой карты на витрине
        if (!user.bestCards.find(c => c.id === payload.id)) {
            if (user.bestCards.length >= 3) user.bestCards.shift(); // Если уже 3 карты, удаляем самую старую
            user.bestCards.push(payload);
        }
    } else if (action === 'remove_best') {
        user.bestCards = user.bestCards.filter(c => c.id !== payload); // Удаляем по ID
    }
    
    res.json({ success: true, user });
});

// НОВЫЙ МАРШРУТ: Сохранение накликанных монет из Шахты
app.post('/api/add_coins', (req, res) => {
    const { telegram_id, amount } = req.body;
    const user = database[telegram_id];
    
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    
    // Защита от читеров: не больше 100 монет за один запрос (каждые 3 секунды)
    if (amount > 0 && amount <= 100) {
        user.coins += amount;
    }
    
    res.json({ success: true, coins: user.coins });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Сервер запущен на порту ${PORT}`); });
