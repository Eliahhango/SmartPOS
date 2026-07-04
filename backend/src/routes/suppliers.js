const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

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
router.post('/', authorize('admin', 'manager'), validate.createSupplier, async (req, res) => {
  try {
    const { name, phone, email, address, tinNumber } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, phone, email, address, tinNumber }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/suppliers/:id
router.put('/:id', authorize('admin', 'manager'), validate.updateSupplier, async (req, res) => {
  try {
    const { name, phone, email, address, tinNumber, balance } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (tinNumber !== undefined) data.tinNumber = tinNumber;
    if (balance !== undefined) data.balance = parseFloat(balance);

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', authorize('admin'), validate.deleteSupplier, async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/suppliers/:id/payments — record a payment to supplier (reduces balance)
router.post('/:id/payments', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { amount, method, referenceNo, notes, purchaseId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be > 0' });

    const supplier = await prisma.supplier.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const payment = await prisma.$transaction(async (tx) => {
      await tx.supplier.update({
        where: { id: parseInt(req.params.id) },
        data: { balance: { decrement: parseFloat(amount) } }
      });

      return tx.supplierPayment.create({
        data: {
          supplierId: parseInt(req.params.id),
          amount: parseFloat(amount),
          method: method || 'cash',
          referenceNo: referenceNo || null,
          notes: notes || null,
          purchaseId: purchaseId ? parseInt(purchaseId) : null
        }
      });
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/suppliers/:id/payments — list payments for a supplier
router.get('/:id/payments', async (req, res) => {
  try {
    const payments = await prisma.supplierPayment.findMany({
      where: { supplierId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
