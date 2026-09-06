import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productsRouter from './routes/products';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients / same-origin requests carry no Origin header.
      // Only allow-listed origins receive CORS headers in the browser.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, origin || true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '75mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/products', productsRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SUTRIXA AI Backend running on port ${PORT}`);
});
