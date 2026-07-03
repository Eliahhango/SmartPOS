const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/users
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        status: true, branchId: true, createdAt: true,
        branch: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);

    // Prevent self-demotion or self-role changes
    if (targetId === req.user.id) {
      return res.status(403).json({ error: 'Cannot modify your own account via this endpoint' });
    }

    // ⛔ Email cannot be changed via this endpoint — that would allow account takeover
    // Users can only change their email via PUT /api/auth/profile (self-service)
    const { name, phone, role, status, branchId, password } = req.body;
    const data = {};

    // Validate fields with sanitization
    if (name) {
      if (typeof name !== 'string' || name.trim().length < 1) {
        return res.status(400).json({ error: 'Invalid name' });
      }
      data.name = name.trim();
    }
    if (phone !== undefined) data.phone = String(phone).trim();
    if (role) {
      const validRoles = ['admin', 'manager', 'cashier', 'stock_officer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      data.role = role;
    }
    if (status) {
      const validStatuses = ['active', 'suspended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      data.status = status;
    }
    if (branchId !== undefined) data.branchId = parseInt(branchId);
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        status: true, branchId: true, createdAt: true,
        branch: { select: { id: true, name: true } }
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/suspend
router.put('/:id/suspend', authorize('admin'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'suspended' }
    });
    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/activate
router.put('/:id/activate', authorize('admin'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'active' }
    });
    res.json({ message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
