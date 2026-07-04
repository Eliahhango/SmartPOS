const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// GET /api/inventory/stock
router.get('/stock', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
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

// POST /api/inventory/stock-in — Dedicated Stock In (with batch support)
router.post('/stock-in', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), async (req, res) => {
  try {
    const { productId, quantity, notes, referenceNo, batchNumber } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'productId and quantity (>=1) are required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update product batch number if provided
      const updateData = { stockQuantity: { increment: parseInt(quantity) } };
      if (batchNumber) updateData.batchNumber = batchNumber;

      const product = await tx.product.update({
        where: { id: parseInt(productId) },
        data: updateData
      });

      await tx.stockMovement.create({
        data: {
          productId: parseInt(productId),
          branchId: req.user.branchId,
          batchNumber: batchNumber || null,
          changeQty: parseInt(quantity),
          reason: 'stock_in',
          referenceType: referenceNo ? 'purchase' : 'adjustment',
          referenceId: null,
          userId: req.user.id,
          notes: notes || `Stock In: +${quantity} units${batchNumber ? ` (Batch: ${batchNumber})` : ''}`
        }
      });

      return product;
    });

    req.audit({ action: 'create', entity: 'inventory', entityId: result.id, description: `Stock In: +${req.body.quantity} units of "${result.name}"${req.body.batchNumber ? ` (Batch: ${req.body.batchNumber})` : ''}`, metadata: { productId: result.id, quantity: parseInt(req.body.quantity), batchNumber: req.body.batchNumber, referenceNo: req.body.referenceNo } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/stock-out — Dedicated Stock Out
router.post('/stock-out', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'productId and quantity (>=1) are required' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required (damage, expiry, theft, return_to_supplier, other)' });
    }

    const validReasons = ['damage', 'expiry', 'theft', 'return_to_supplier', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: `Reason must be one of: ${validReasons.join(', ')}` });
    }

    // Pre-check stock availability
    const current = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!current) return res.status(404).json({ error: 'Product not found' });
    if (current.stockQuantity < parseInt(quantity)) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${current.stockQuantity}, requested: ${quantity}` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: parseInt(productId) },
        data: { stockQuantity: { decrement: parseInt(quantity) } }
      });

      await tx.stockMovement.create({
        data: {
          productId: parseInt(productId),
          branchId: req.user.branchId,
          changeQty: -parseInt(quantity),
          reason: 'stock_out',
          referenceType: reason,
          userId: req.user.id,
          notes: notes || `Stock Out: -${quantity} units (${reason})`
        }
      });

      return updated;
    });

    req.audit({ action: 'create', entity: 'inventory', entityId: parseInt(req.body.productId), description: `Stock Out: -${req.body.quantity} units (${req.body.reason})`, metadata: { productId: parseInt(req.body.productId), quantity: -parseInt(req.body.quantity), reason: req.body.reason } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/adjustment
router.post('/adjustment', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), validate.createAdjustment, async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;

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

    req.audit({ action: 'update', entity: 'inventory', entityId: parseInt(req.body.productId), description: `Stock Adjustment: ${parseInt(req.body.quantity) > 0 ? '+' : ''}${req.body.quantity} units (${req.body.reason})`, metadata: { productId: parseInt(req.body.productId), quantity: parseInt(req.body.quantity), reason: req.body.reason } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/stock-movements
router.get('/stock-movements', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
  try {
    const { productId, reason, batchNumber, page = 1, limit = 50 } = req.query;
    const where = {};
    if (productId) where.productId = parseInt(productId);
    if (reason) where.reason = reason;
    if (batchNumber) where.batchNumber = { contains: batchNumber };

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

// GET /api/inventory/reorder-suggestions — products that need reordering, grouped by supplier
router.get('/reorder-suggestions', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const lowProducts = await prisma.product.findMany({
      where: {
        status: 'active',
        stockQuantity: { lte: prisma.product.fields.minimumStock }
      },
      include: { supplier: true, category: true },
      orderBy: [{ supplierId: 'asc' }, { stockQuantity: 'asc' }]
    });

    const suggestions = lowProducts.map(p => {
      const reorderQty = p.reorderQuantity > 0
        ? p.reorderQuantity
        : Math.max(p.minimumStock * 2 - p.stockQuantity, 1);
      return {
        productId: p.id,
        productName: p.name,
        barcode: p.barcode,
        sku: p.sku,
        category: p.category?.name,
        supplierId: p.supplierId,
        supplierName: p.supplier?.name || 'No Supplier',
        currentStock: p.stockQuantity,
        minimumStock: p.minimumStock,
        reorderQuantity: reorderQty,
        unit: p.unit,
        costPrice: p.costPrice,
        estimatedCost: p.costPrice * reorderQty
      };
    });

    // Group by supplier
    const bySupplier = suggestions.reduce((acc, s) => {
      const key = s.supplierName;
      if (!acc[key]) acc[key] = { supplier: key, items: [], total: 0, count: 0 };
      acc[key].items.push(s);
      acc[key].total += s.estimatedCost;
      acc[key].count += 1;
      return acc;
    }, {});

    res.json({
      total: suggestions.length,
      totalEstimatedCost: suggestions.reduce((s, i) => s + i.estimatedCost, 0),
      bySupplier: Object.values(bySupplier),
      items: suggestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/low-stock-alerts — returns count + list of products below minimumStock
router.get('/low-stock-alerts', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
  try {
    const where = {
      status: 'active',
      stockQuantity: { lte: prisma.product.fields.minimumStock }
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: true },
        orderBy: { stockQuantity: 'asc' },
        take: 50
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      total,
      critical: products.filter(p => p.stockQuantity === 0).length,
      low: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minimumStock).length,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/products/:id/stock-movements
router.get('/products/:id/stock-movements', authorize('admin', 'manager', 'stock_officer', 'accountant'), async (req, res) => {
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
