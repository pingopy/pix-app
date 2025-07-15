const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, findUserById } = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    findUserById(user.id, (err, dbUser) => {
      if (err || !dbUser) return res.status(401).json({ error: 'Usuário não encontrado.' });
      req.user = dbUser;
      next();
    });
  });
}

// Cadastro
router.post('/register', (req, res) => {
  const { username, email, password, api_token, cnpj } = req.body;
  if (!username || !email || !password || !api_token || !cnpj)
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });

  findUserByEmail(email, (err, user) => {
    if (user) return res.status(409).json({ error: 'Email já cadastrado.' });
    const hash = bcrypt.hashSync(password, 12);
    createUser(username, email, hash, api_token, cnpj, function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  findUserByEmail(email, (err, user) => {
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  });
});

module.exports = {
  router,
  authenticateToken
};
