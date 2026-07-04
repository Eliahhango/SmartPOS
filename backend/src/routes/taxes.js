const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

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
router.post('/', authorize('admin'), validate.createTax, async (req, res) => {
  try {
    const { name, ratePercent, isActive } = req.body;

    const tax = await prisma.taxRate.create({
      data: { name, ratePercent: parseFloat(ratePercent) || 0, isActive: isActive !== false }
    });
    res.status(201).json(tax);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/taxes/:id
router.put('/:id', authorize('admin'), validate.updateTax, async (req, res) => {
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

// DELETE /api/taxes/:id
router.delete('/:id', authorize('admin'), validate.deleteTax, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if any products reference this tax rate
    const productCount = await prisma.product.count({ where: { taxClassId: id } });
    if (productCount > 0) {
      return res.status(409).json({
        error: `Cannot delete tax rate: ${productCount} product(s) still use it. Set them to a different tax rate first, or deactivate this rate instead.`
      });
    }

    await prisma.taxRate.delete({ where: { id } });
    res.json({ message: 'Tax rate deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Tax rate not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
