const cors = require('cors');
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'tcg-forum' });
});

app.use('/api', async (req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// rotas
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota nao encontrada' });
});

app.use(errorMiddleware);

module.exports = app;
