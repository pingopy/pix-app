import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config.js';
import paymentsRouter from './routes/payments.js';

const app = express();
app.use(cors());
app.use(express.json());

// Configuração para servir arquivos estáticos do frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajuste o caminho abaixo se a pasta do frontend estiver em outro local
app.use(express.static(path.join(__dirname, '../../frontend')));

// Suas rotas de API
app.use('/api', paymentsRouter);

// Fallback: para SPA, redireciona todas as rotas não reconhecidas para o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
