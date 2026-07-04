const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/clock-in', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        clockIn: { gte: today, lt: tomorrow },
        clockOut: null
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already clocked in today. Please clock out first.' });
    }

    const attendance = await prisma.attendance.create({
      data: { userId: req.user.id }
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/clock-out', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        clockIn: { gte: today, lt: tomorrow },
        clockOut: null
      }
    });

    if (!attendance) {
      return res.status(400).json({ error: 'No active clock-in found for today.' });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { clockOut: new Date() }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authorize('admin', 'manager', 'cashier'), async (req, res) => {
  try {
    const { page = 1, limit = 50, userId } = req.query;
    const where = {};

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      if (userId) where.userId = parseInt(userId);
    } else {
      where.userId = req.user.id;
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { user: { select: { id: true, name: true } } },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { clockIn: 'desc' }
      }),
      prisma.attendance.count({ where })
    ]);

    res.json({ records, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: req.user.id,
        clockIn: { gte: today, lt: tomorrow }
      },
      orderBy: { clockIn: 'desc' }
    });

    res.json({ attendance, isClockedIn: !!attendance && !attendance.clockOut });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
