const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/taxes
router.get('/', async (req, res) => {
  try {
    const taxes = await prisma.taxRate.findMany({ orderBy: { name: 'asc' } });
    res.json(taxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/taxes
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { name, ratePercent, isActive } = req.body;
    if (!name) return res.status(400).json({ error: 'Tax name required' });

    const tax = await prisma.taxRate.create({
      data: { name, ratePercent: parseFloat(ratePercent) || 0, isActive: isActive !== false }
    });
    res.status(201).json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/taxes/:id
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { name, ratePercent, isActive } = req.body;
    const data = {};
    if (name) data.name = name;
    if (ratePercent !== undefined) data.ratePercent = parseFloat(ratePercent);
    if (isActive !== undefined) data.isActive = isActive;

    const tax = await prisma.taxRate.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
