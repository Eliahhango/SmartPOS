const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// Rate limiter — dual key: per-socket-IP + per-account (email).
// Uses req.socket.remoteAddress (not X-Forwarded-For) to prevent spoofing.
const ipLimiter = new Map();    // key: realIP → count
const emailLimiter = new Map(); // key: normalized-email → count
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipLimiter)    { if (now > v.resetAt) ipLimiter.delete(k); }
  for (const [k, v] of emailLimiter)  { if (now > v.resetAt) emailLimiter.delete(k); }
}, WINDOW_MS);

/** Always returns the same generic message to prevent user enumeration */
const GENERIC_LOGIN_ERROR = 'Invalid email or password';

function checkRateLimit(map, key) {
  const now = Date.now();
  let entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    map.set(key, entry);
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic field validation (same generic response for all failures)
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    // Real connection IP — NOT from headers (prevents X-Forwarded-For spoofing)
    const realIP = req.socket.remoteAddress || 'unknown';
    const normalizedEmail = email.toLowerCase().trim();

    // Dual rate limiting: per-IP AND per-account (harder to bypass)
    if (checkRateLimit(ipLimiter, realIP)) {
      return res.status(429).json({ error: GENERIC_LOGIN_ERROR });
    }
    if (checkRateLimit(emailLimiter, normalizedEmail)) {
      return res.status(429).json({ error: GENERIC_LOGIN_ERROR });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { branch: true }
    });

    // Single generic message for: no user, suspended, wrong password
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: GENERIC_LOGIN_ERROR });
    }

    // Generate jti for token uniqueness / revocation
    const jti = crypto.randomBytes(16).toString('hex');
    const token = jwt.sign(
      { id: user.id, role: user.role, jti },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return only safe fields — never expose password hash or internal metadata
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      branchId: user.branchId,
      branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null,
      createdAt: user.createdAt
    };
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/auth/register
router.post('/register', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { name, email, phone, password, role, branchId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'cashier',
        branchId: branchId ? parseInt(branchId) : null
      }
    });

    const { password: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me — minimal field exposure, no branch internals
router.get('/me', authenticate, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    status: req.user.status,
    branchId: req.user.branchId,
    branch: req.user.branch ? { id: req.user.branch.id, name: req.user.branch.name } : null,
    createdAt: req.user.createdAt
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: { branch: true }
    });

    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
