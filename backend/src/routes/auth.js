const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

// In-memory rate limiter for login (IP-based, 5 attempts per minute)
const loginAttempts = new Map();
setInterval(() => {
  for (const [key, entry] of loginAttempts) {
    if (Date.now() - entry.resetAt > 60_000) loginAttempts.delete(key);
  }
}, 60_000);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Get client IP from x-forwarded-for (Railway proxy) or fallback
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.ip || req.socket.remoteAddress || 'unknown';
    const rateKey = `${ip}:${email || 'unknown'}`;
    const now = Date.now();

    // Rate limiting (per IP+email combo — 5 attempts/min)
    if (!loginAttempts.has(rateKey)) {
      loginAttempts.set(rateKey, { count: 0, resetAt: now + 60_000 });
    }
    const entry = loginAttempts.get(rateKey);
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + 60_000;
    }
    entry.count++;
    if (entry.count > 5) {
      return res.status(429).json({ error: 'Too many login attempts. Try again in 1 minute.' });
    }
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true }
    });

    if (!user || user.status === 'suspended') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate jti for token uniqueness / revocation
    const jti = crypto.randomBytes(16).toString('hex');
    const token = jwt.sign(
      { id: user.id, role: user.role, jti },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const { password: _, ...userData } = req.user;
  res.json(userData);
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
