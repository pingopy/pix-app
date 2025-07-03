import { Router } from 'express';
import paggpixClient from '../utils/paggpixClient.js';

const router = Router();

// criar pagamento
router.post('/payments', async (req, res) => {
  try {
    const { value, description } = req.body;
    const data = await paggpixClient.createPayment({ value, description });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

// consultar status
router.get('/payments/:id', async (req, res) => {
  try {
    const data = await paggpixClient.getPayment(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export default router;
