import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute window
  limit: process.env.NODE_ENV === "production" ? 300 : 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
