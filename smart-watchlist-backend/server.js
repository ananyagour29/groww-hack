const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Watchlist = require('./models/Watchlist');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-watchlist';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MOCK STOCK DATABASE WITH AUTO-FLUCTUATION ---
const MOCK_STOCKS = [
  { symbol: 'ZOMATO', name: 'Zomato Limited', price: 275.50, change: 3.20, volume: '45,21,000' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', price: 2950.00, change: -0.85, volume: '12,15,400' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.25, change: 1.50, volume: '8,42,100' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1845.60, change: 2.10, volume: '15,30,200' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: 980.40, change: -1.20, volume: '22,10,500' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 790.10, change: 0.75, volume: '31,40,000' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 1540.00, change: 1.10, volume: '10,50,000' },
  { symbol: 'ITC', name: 'ITC Limited', price: 450.30, change: -0.40, volume: '18,90,000' }
];

// Helper to get stock details with a slight random demo fluctuation (+/- 2.5%)
const getStockDetails = (symbol) => {
  const found = MOCK_STOCKS.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
  let baseStock = found || { symbol: symbol.toUpperCase(), name: `${symbol.toUpperCase()} Corporation`, price: 500.00, change: 1.25, volume: '5,00,000' };
  
  // Demo Fluctuation Trick: Generates a small random variation between -2.5% and +2.5% on each fetch
  const randomPercent = (Math.random() * 5 - 2.0); // e.g. -2% to +3%
  const fluctuatedPrice = baseStock.price * (1 + randomPercent / 100);
  const fluctuatedChange = baseStock.change + (randomPercent / 2);

  return {
    ...baseStock,
    price: Number(fluctuatedPrice.toFixed(2)),
    change: Number(fluctuatedChange.toFixed(2))
  };
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- WATCHLIST ROUTES ---
app.get('/api/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const watchlist = await Watchlist.find({ userId: req.user.id });
    const threshold = user.threshold || 2.0;

    const detailedWatchlist = watchlist.map((item) => {
      const stockInfo = getStockDetails(item.symbol);
      const currentPrice = stockInfo.price;
      const todayChange = stockInfo.change;
      
      const changeSinceLastCheck = ((currentPrice - item.lastCheckedPrice) / item.lastCheckedPrice) * 100;
      const meaningful = Math.abs(changeSinceLastCheck) >= threshold;

      return {
        symbol: item.symbol,
        name: item.name || stockInfo.name,
        currentPrice: Number(currentPrice.toFixed(2)),
        todayChange: Number(todayChange.toFixed(2)),
        lastCheckedPrice: item.lastCheckedPrice,
        changeSinceLastCheck: Number(changeSinceLastCheck.toFixed(2)),
        meaningful
      };
    });

    res.json(detailedWatchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/watchlist', auth, async (req, res) => {
  try {
    const { symbol, name } = req.body;
    const existing = await Watchlist.findOne({ userId: req.user.id, symbol });
    if (existing) return res.status(400).json({ message: 'Stock already in watchlist' });

    const stockInfo = getStockDetails(symbol);

    const watchlistItem = new Watchlist({
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      name: name || stockInfo.name,
      lastCheckedPrice: stockInfo.price // Base price when added
    });

    await watchlistItem.save();
    res.status(201).json(watchlistItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/watchlist/:symbol', auth, async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({ userId: req.user.id, symbol: req.params.symbol });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- STOCK SEARCH ROUTE ---
app.get('/api/stocks/search', async (req, res) => {
  const query = req.query.q ? req.query.q.trim().toLowerCase() : '';
  if (!query) return res.json([]);

  const results = MOCK_STOCKS.filter(
    s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
  );

  if (results.length > 0) {
    return res.json(results.slice(0, 5));
  }

  res.json([
    { symbol: query.toUpperCase(), name: `${query.toUpperCase()} Company Limited` }
  ]);
});

// --- STOCK DETAILS ROUTE ---
app.get('/api/stocks/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockInfo = getStockDetails(symbol);

    const watchlistItem = await Watchlist.findOne({ userId: req.user.id, symbol });
    const lastCheckedPrice = watchlistItem ? watchlistItem.lastCheckedPrice : stockInfo.price;
    const currentPrice = stockInfo.price;
    const changeSinceLastCheck = ((currentPrice - lastCheckedPrice) / lastCheckedPrice) * 100;
    
    const user = await User.findById(req.user.id);
    const meaningful = Math.abs(changeSinceLastCheck) >= (user.threshold || 2.0);

    res.json({
      symbol: symbol.toUpperCase(),
      name: stockInfo.name,
      currentPrice: Number(currentPrice.toFixed(2)),
      todayChange: Number(stockInfo.change.toFixed(2)),
      lastCheckedPrice: Number(lastCheckedPrice.toFixed(2)),
      changeSinceLastCheck: Number(changeSinceLastCheck.toFixed(2)),
      meaningful,
      volume: stockInfo.volume,
      updatedAgo: 'Just now'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stock details' });
  }
});

// --- PREFERENCES ROUTES ---
app.get('/api/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ threshold: user.threshold || 2.0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/preferences', auth, async (req, res) => {
  try {
    const { threshold } = req.body;
    await User.findByIdAndUpdate(req.user.id, { threshold });
    res.json({ message: 'Preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});