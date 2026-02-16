import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRouter from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', generateRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Instant Test API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Instant Test Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
});
