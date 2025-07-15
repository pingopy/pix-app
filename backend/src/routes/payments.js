const express = require('express');
const axios = require('axios');
const { createPayment, listPaymentsByUser } = require('../models/payment');
const router = express.Router();

// Rota para criar um novo pagamento PIX
router.post('/', async (req, res) => {
  const { value, description } = req.body;
  const { api_token, cnpj, id: user_id } = req.user;

  // Validação básica dos campos
  if (!value || !api_token || !cnpj) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
  }

  try {
    // Chamada à API externa PaggPix
    const response = await axios.post(
      `${process.env.BASE_URL}/payments`,
      { cnpj, value, description },
      { headers: { Authorization: `Bearer ${api_token}` } }
    );

    const data = response.data;

    // Salva o pagamento no banco local
    createPayment(
      user_id,
      data.pix_id,
      data.value,
      data.description,
      data.status,
      data.pix_code,
      (err) => {
        if (err) {
          // Log opcional: console.error('Erro ao salvar pagamento:', err);
        }
      }
    );

    res.status(201).json(data);
  } catch (err) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: err.message };
    res.status(status).json(data);
  }
});

// Rota para listar histórico de pagamentos do usuário autenticado
router.get('/history', (req, res) => {
  listPaymentsByUser(req.user.id, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }
    res.json(rows);
  });
});

module.exports = router;
