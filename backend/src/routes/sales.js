const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// POST /api/sales - Create a sale with split payments
router.post('/', async (req, res) => {
  try {
    const { customerId, items, payments, discount = 0, status = 'completed' } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'At least one item required' });
    if (!payments || !payments.length) return res.status(400).json({ error: 'At least one payment required' });

    // Validate payment methods against allowed enum
    const VALID_METHODS = ['cash', 'mobile_money', 'card', 'bank'];
    for (const p of payments) {
      if (!VALID_METHODS.includes(p.method)) {
        return res.status(400).json({ error: `Invalid payment method '${p.method}'. Must be one of: ${VALID_METHODS.join(', ')}` });
      }
    }

    // Calculate totals
    let subtotal = 0;
    let taxTotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { taxClass: true }
      });
      if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const price = item.price || product.sellingPrice;
      const lineTotal = parseFloat(price) * item.quantity;
      const taxRate = product.taxClass?.ratePercent || 0;
      const lineTax = (lineTotal * parseFloat(taxRate)) / (100 + parseFloat(taxRate));

      subtotal += lineTotal - lineTax;
      taxTotal += lineTax;

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: parseFloat(price),
        taxRateApplied: parseFloat(taxRate),
        total: lineTotal
      });
    }

    const grandTotal = subtotal + taxTotal - parseFloat(discount);

    // Validate payments match grand total
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    if (Math.abs(totalPaid - grandTotal) > 0.01) {
      return res.status(400).json({ error: `Payment total (${totalPaid}) does not match grand total (${grandTotal})` });
    }

    // Create sale with items and payments in transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Generate unique invoice number inside transaction to avoid race conditions
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const count = await tx.sale.count({
        where: { createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) } }
      });
      const invoiceNo = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

      const s = await tx.sale.create({
        data: {
          invoiceNo,
          customerId: customerId ? parseInt(customerId) : null,
          cashierId: req.user.id,
          branchId: req.user.branchId,
          subtotal,
          discount: parseFloat(discount),
          taxTotal,
          grandTotal,
          status,
          items: { create: saleItems },
          payments: {
            create: payments.map(p => ({
              method: p.method,
              amount: parseFloat(p.amount),
              amountReceived: p.amountReceived ? parseFloat(p.amountReceived) : null,
              changeGiven: p.changeGiven ? parseFloat(p.changeGiven) : null,
              referenceNo: p.referenceNo || null
            }))
          }
        },
        include: { items: { include: { product: true } }, payments: true, customer: true, cashier: true }
      });

      // Update stock and create stock movements
      for (const item of saleItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            branchId: req.user.branchId,
            changeQty: -item.quantity,
            reason: 'sale',
            referenceType: 'sale',
            referenceId: s.id,
            userId: req.user.id
          }
        });
      }

      // Add loyalty points if customer
      if (customerId) {
        const points = Math.floor(grandTotal / 1000); // 1 point per 1000 spent
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: { points: { increment: points } }
        });
      }

      return s;
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate, cashierId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (cashierId) where.cashierId = parseInt(cashierId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: { include: { product: true } },
          payments: true,
          customer: true,
          cashier: { select: { id: true, name: true } }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sale.count({ where })
    ]);

    res.json({ sales, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales/:id
router.get('/:id', async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: true } },
        payments: true,
        customer: true,
        cashier: { select: { id: true, name: true } },
        returns: { include: { items: { include: { saleItem: { include: { product: true } } } } } }
      }
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sales/:id/suspend
router.put('/:id/suspend', async (req, res) => {
  try {
    const sale = await prisma.sale.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'suspended' }
    });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sales/:id/resume
router.put('/:id/resume', async (req, res) => {
  try {
    const sale = await prisma.sale.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'completed' }
    });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sales/:id/returns
router.post('/:id/returns', async (req, res) => {
  try {
    const { items, refundMethod, reason } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Return items required' });

    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true }
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    let refundAmount = 0;
    const returnItems = [];

    for (const ri of items) {
      const saleItem = sale.items.find(si => si.id === ri.saleItemId);
      if (!saleItem) return res.status(400).json({ error: `Sale item ${ri.saleItemId} not found in this sale` });
      if (ri.quantity > saleItem.quantity) return res.status(400).json({ error: 'Return quantity exceeds sold quantity' });

      const itemRefund = (parseFloat(saleItem.total) / saleItem.quantity) * ri.quantity;
      refundAmount += itemRefund;

      returnItems.push({
        saleItemId: saleItem.id,
        quantity: ri.quantity,
        restocked: ri.restocked || false
      });
    }

    const salesReturn = await prisma.$transaction(async (tx) => {
      const sr = await tx.salesReturn.create({
        data: {
          saleId: sale.id,
          processedBy: req.user.id,
          refundMethod,
          refundAmount,
          reason,
          items: { create: returnItems }
        },
        include: { items: true }
      });

      // Restock items if flagged
      for (const ri of returnItems) {
        if (ri.restocked) {
          const saleItem = sale.items.find(si => si.id === ri.saleItemId);
          await tx.product.update({
            where: { id: saleItem.productId },
            data: { stockQuantity: { increment: ri.quantity } }
          });
          await tx.stockMovement.create({
            data: {
              productId: saleItem.productId,
              branchId: req.user.branchId,
              changeQty: ri.quantity,
              reason: 'return',
              referenceType: 'sales_return',
              referenceId: sr.id,
              userId: req.user.id
            }
          });
        }
      }

      // Update sale status
      const allReturned = returnItems.every(ri => {
        const si = sale.items.find(s => s.id === ri.saleItemId);
        return si && ri.quantity >= si.quantity;
      });

      await tx.sale.update({
        where: { id: sale.id },
        data: { status: allReturned ? 'refunded' : 'partially_refunded' }
      });

      return sr;
    });

    res.status(201).json(salesReturn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales-returns
router.get('/returns/list', async (req, res) => {
  try {
    const returns = await prisma.salesReturn.findMany({
      include: {
        sale: { select: { invoiceNo: true } },
        items: { include: { saleItem: { include: { product: true } } } },
        processor: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
