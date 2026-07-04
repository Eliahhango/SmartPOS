const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: { branch: { select: { id: true, name: true } } },
      orderBy: { id: 'asc' }
    });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { name, startTime, endTime, branchId } = req.body;
    const shift = await prisma.shift.create({
      data: { name, startTime, endTime, branchId: branchId ? parseInt(branchId) : null }
    });
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { name, startTime, endTime, branchId } = req.body;
    const shift = await prisma.shift.update({
      where: { id: parseInt(req.params.id) },
      data: { name, startTime, endTime, branchId: branchId ? parseInt(branchId) : null }
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await prisma.shift.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/assign', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { shiftId, userId, date } = req.body;
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId: parseInt(shiftId),
        userId: parseInt(userId),
        date: new Date(date)
      },
      include: {
        shift: true,
        user: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/assignments', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { date, userId } = req.query;
    const where = {};
    if (date) where.date = new Date(date);
    if (userId) where.userId = parseInt(userId);

    const assignments = await prisma.shiftAssignment.findMany({
      where,
      include: {
        shift: true,
        user: { select: { id: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
