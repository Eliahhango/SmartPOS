require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { MulterError } = require('multer');
const rateLimit = require('express-rate-limit');

// ── Environment Validation (skip in test mode) ──────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const REQUIRED_ENV = [
    { key: 'DATABASE_URL', desc: 'PostgreSQL/MySQL connection string for Prisma' },
    { key: 'JWT_SECRET',   desc: 'Secret key used to sign and verify JWT tokens' },
  ];

  const missing = REQUIRED_ENV.filter(e => !process.env[e.key]);
  if (missing.length > 0) {
    const msg = missing.map(e => `  MISSING: ${e.key} — ${e.desc}`).join('\n');
    console.error('\n❌ FATAL: Required environment variables are not set:\n' + msg + '\n');
    process.exit(1);
  }

  if (!process.env.FRONTEND_URL) {
    console.warn('⚠ WARNING: FRONTEND_URL not set. CORS will default to http://localhost:3000');
  }
  if (!process.env.JWT_EXPIRES_IN) {
    console.warn('⚠ WARNING: JWT_EXPIRES_IN not set. Defaulting to 24h');
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const customerRoutes = require('./routes/customers');
const saleRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchases');
const inventoryRoutes = require('./routes/inventory');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const taxRoutes = require('./routes/taxes');
const branchRoutes = require('./routes/branches');
const userRoutes = require('./routes/users');
const auditLogRoutes = require('./routes/auditLog');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy — required for req.ip behind Railway/Vercel reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Only serve /uploads in development; in production, remove this attack surface
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));
}

// ── Rate Limiting ────────────────────────────────────────────────────────────
// All API routes are rate-limited to prevent abuse.
// The login endpoint has its own stricter limit in auth.js (3/60s).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Auth routes get a stricter global cap (login endpoint has its own 3/60s)
app.use('/api/auth', authLimiter);
// All other /api/* routes get the standard limit
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth')) return next(); // already limited above
  apiLimiter(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 catch-all — return JSON for any unmatched API route
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler — never leak stack traces or internal details in production
app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  if (err instanceof MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message?.startsWith('Invalid image type') || err.message?.startsWith('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal Server Error'
  });
});

// Only start listening when not in test mode (supertest manages its own server)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`SmartPOS API running on port ${PORT}`);
  });
}

module.exports = app;
