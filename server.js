require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Route modules
const authRoutes     = require('./src/routes/authRoutes');
const pantryRoutes   = require('./src/routes/pantryRoutes');
const groceryRoutes  = require('./src/routes/groceryRoutes');
const recipeRoutes   = require('./src/routes/recipeRoutes');
const alertRoutes    = require('./src/routes/alertRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/pantry',   pantryRoutes);
app.use('/api/grocery',  groceryRoutes);
app.use('/api/recipes',  recipeRoutes);
app.use('/api/alerts',   alertRoutes);
app.use('/api/settings', settingsRoutes);

// DB health check
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, message: 'PostgreSQL connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, message: 'DB connection failed', error: error.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ PantryPal server running on port ${PORT}`);
  console.log(`   Auth:     http://localhost:${PORT}/api/auth`);
  console.log(`   Pantry:   http://localhost:${PORT}/api/pantry`);
  console.log(`   Grocery:  http://localhost:${PORT}/api/grocery`);
  console.log(`   Recipes:  http://localhost:${PORT}/api/recipes`);
  console.log(`   Alerts:   http://localhost:${PORT}/api/alerts`);
  console.log(`   Settings: http://localhost:${PORT}/api/settings`);
});
