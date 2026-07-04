const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

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
router.put('/:id', authorize('admin'), validate.updateUser, async (req, res) => {
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

    if (name) data.name = name.trim();
    if (phone !== undefined) data.phone = String(phone).trim();
    if (role) data.role = role;
    if (status) data.status = status;
    if (branchId !== undefined) data.branchId = parseInt(branchId);
    if (password) data.password = await bcrypt.hash(password, 10);

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
router.put('/:id/suspend', authorize('admin'), validate.suspendUser, async (req, res) => {
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
router.put('/:id/activate', authorize('admin'), validate.activateUser, async (req, res) => {
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
