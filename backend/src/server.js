require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Banco de dados
const db = require('./utils/db');

// Rotas e middlewares
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, '../../frontend')));

// Redirecionar raiz para login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/payments', authenticateToken, paymentsRoutes);

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
