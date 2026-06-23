import express from 'express';
import cors from 'cors';
import statsRouter from './routes/stats.js';
import trendingRouter from './routes/trending.js';
import suggestionsRouter from './routes/suggestions.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/stats',       statsRouter);
app.use('/api/trending',    trendingRouter);
app.use('/api/suggestions', suggestionsRouter);

app.listen(PORT, () => console.log(`Pāka API running on :${PORT}`));
