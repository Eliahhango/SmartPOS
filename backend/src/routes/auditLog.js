const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/audit-logs — paginated list (admin only)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, entity, action, userId } = req.query;
    const where = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, role: true } } },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit-logs/entities — list all distinct entity types with counts
router.get('/entities', authorize('admin'), async (req, res) => {
  try {
    const entities = await prisma.auditLog.groupBy({
      by: ['entity'],
      _count: { entity: true },
      orderBy: { _count: { entity: 'desc' } }
    });
    res.json(entities.map(e => ({ entity: e.entity, count: e._count.entity })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
