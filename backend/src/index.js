import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import paymentsRouter from './routes/payments.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', paymentsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
