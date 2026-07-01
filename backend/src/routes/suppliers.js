const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { _count: { select: { products: true, purchases: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { products: true, purchases: { include: { items: { include: { product: true } } } } }
    });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, phone, email, address, tinNumber } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name required' });

    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address, tinNumber }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, phone, email, address, tinNumber } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(req.params.id) },
      data: { name, phone, email, address, tinNumber }
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
