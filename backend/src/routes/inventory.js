const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/inventory/stock
router.get('/stock', async (req, res) => {
  try {
    const { lowStock, outOfStock, expiring, categoryId, page = 1, limit = 50 } = req.query;
    const where = {};

    if (lowStock === 'true') where.stockQuantity = { lte: prisma.product.fields.minimumStock, gt: 0 };
    if (outOfStock === 'true') where.stockQuantity = 0;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (expiring === 'true') {
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      where.expiryDate = { lte: thirtyDays };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: true },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { stockQuantity: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/adjustment
router.post('/adjustment', authorize('admin', 'manager', 'stock_officer'), async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    if (!productId || !quantity || !reason) {
      return res.status(400).json({ error: 'productId, quantity, and reason required' });
    }

    const validReasons = ['adjustment', 'damage', 'expiry'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: `Reason must be one of: ${validReasons.join(', ')}` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: parseInt(productId) },
        data: { stockQuantity: { increment: parseInt(quantity) } }
      });

      await tx.stockMovement.create({
        data: {
          productId: parseInt(productId),
          branchId: req.user.branchId,
          changeQty: parseInt(quantity),
          reason,
          referenceType: 'adjustment',
          userId: req.user.id,
          notes
        }
      });

      return product;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/stock-movements
router.get('/stock-movements', async (req, res) => {
  try {
    const { productId, reason, page = 1, limit = 50 } = req.query;
    const where = {};
    if (productId) where.productId = parseInt(productId);
    if (reason) where.reason = reason;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: { product: true, user: { select: { id: true, name: true } }, branch: true },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({ movements, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/products/:id/stock-movements
router.get('/products/:id/stock-movements', async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: parseInt(req.params.id) },
      include: { user: { select: { id: true, name: true } }, branch: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
