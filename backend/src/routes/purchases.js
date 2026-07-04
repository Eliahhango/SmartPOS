const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// GET /api/purchases
router.get('/', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
  try {
    const { page = 1, limit = 50, status, supplierId, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = parseInt(supplierId);
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { supplier: { name: { contains: search } } }
      ];
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: true,
          items: { include: { product: true } },
          branch: true
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.purchase.count({ where })
    ]);

    res.json({ purchases, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchases/:id
router.get('/:id', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { supplier: true, items: { include: { product: true } }, branch: true }
    });
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases
router.post('/', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), validate.createPurchase, async (req, res) => {
  try {
    const { supplierId, invoiceNo, items, date } = req.body;

    let totalAmount = 0;
    const purchaseItems = items.map(item => {
      const lineTotal = parseFloat(item.costPrice) * item.quantity;
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        costPrice: parseFloat(item.costPrice)
      };
    });

    const purchase = await prisma.purchase.create({
      data: {
        supplierId: parseInt(supplierId),
        branchId: req.user.branchId,
        invoiceNo,
        totalAmount,
        date: date ? new Date(date) : new Date(),
        status: 'draft',
        items: { create: purchaseItems }
      },
      include: { supplier: true, items: { include: { product: true } } }
    });

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/:id/approve
router.post('/:id/approve', authorize('admin', 'manager'), validate.approvePurchase, async (req, res) => {
  try {
    const purchase = await prisma.purchase.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'approved' }
    });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/purchases/:id/receive
router.post('/:id/receive', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), validate.receivePurchase, async (req, res) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    if (purchase.status !== 'approved') {
      return res.status(400).json({ error: 'Purchase must be approved before receiving' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update stock for each item
      for (const item of purchase.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            branchId: req.user.branchId,
            changeQty: item.quantity,
            reason: 'purchase',
            referenceType: 'purchase',
            referenceId: purchase.id,
            userId: req.user.id
          }
        });
      }

      return tx.purchase.update({
        where: { id: purchase.id },
        data: { status: 'received' },
        include: { supplier: true, items: { include: { product: true } } }
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
