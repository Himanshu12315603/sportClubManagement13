import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db';
import { globalErrorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/AppError';
import apiRouter from './routes';
import { expirePendingPurchases } from './modules/payments/payment.service';

// Load env
dotenv.config();

const app = express();

// ---- Security & Middleware ----
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ---- Health Check ----
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    message: '✅ Champions Club API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// ---- Mount Central API Router ----
app.use('/api/v1', apiRouter);

// ---- 404 Handler ----
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ---- Global Error Handler ----
app.use(globalErrorHandler);

// ---- Start Server ----
const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  await connectDB();
  const paymentExpiryTimer = setInterval(() => {
    expirePendingPurchases().catch((error) => {
      console.error('Failed to expire pending purchases:', error);
    });
  }, 5 * 60 * 1000);
  paymentExpiryTimer.unref();
  app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║      🏆 Champions Club API Server 🏆      ║
  ╠══════════════════════════════════════════╣
  ║  Port:  ${PORT}                              ║
  ║  Mode:  ${(process.env.NODE_ENV || 'development').padEnd(32)}║
  ║  URL:   http://localhost:${PORT}/api/v1      ║
  ╚══════════════════════════════════════════╝
    `);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
