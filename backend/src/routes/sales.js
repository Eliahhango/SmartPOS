const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// POST /api/sales - Create a sale with split payments
router.post('/', validate.createSale, async (req, res) => {
  try {
    const { customerId, items, payments, discount = 0, pointsRedeemed = 0, status = 'completed' } = req.body;

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

    let finalDiscount = parseFloat(discount);
    let birthdayDiscount = 0;
    let pointsDiscount = 0;
    let appliedBirthdayReward = false;
    let appliedPointsRedeemed = 0;

    // Birthday reward — 10% off if today is customer's birthday
    if (customerId) {
      const cust = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (cust?.birthday) {
        const today = new Date();
        const bday = new Date(cust.birthday);
        if (today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate()) {
          birthdayDiscount = parseFloat((subtotal + taxTotal) * 0.10);
          appliedBirthdayReward = true;
        }
      }
    }

    // Points redemption — 100 points = $1 discount
    const parsedPointsRedeemed = parseInt(pointsRedeemed) || 0;
    if (parsedPointsRedeemed > 0 && customerId) {
      const cust = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!cust) return res.status(400).json({ error: 'Customer not found' });
      if (parsedPointsRedeemed > cust.points) {
        return res.status(400).json({ error: `Insufficient points. You have ${cust.points}, requested ${parsedPointsRedeemed}` });
      }
      pointsDiscount = parseFloat((parsedPointsRedeemed / 100).toFixed(2));
      appliedPointsRedeemed = parsedPointsRedeemed;
    }

    const grandTotal = subtotal + taxTotal - finalDiscount - birthdayDiscount - pointsDiscount;

    // Validate payments match grand total
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    if (Math.abs(totalPaid - grandTotal) > 0.01) {
      return res.status(400).json({ error: `Payment total (${totalPaid}) does not match grand total (${grandTotal})` });
    }

    // Handle credit payment — check customer exists and credit limit
    const creditPayments = payments.filter(p => p.method === 'credit');
    const hasCredit = creditPayments.length > 0;
    if (hasCredit) {
      if (!customerId) {
        return res.status(400).json({ error: 'Customer is required for credit sales' });
      }
      const cust = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!cust) return res.status(400).json({ error: 'Customer not found' });
      const creditTotal = creditPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
      if (cust.creditLimit > 0 && (cust.balance + creditTotal) > cust.creditLimit) {
        return res.status(400).json({ error: `Credit limit exceeded (${cust.creditLimit}). Current balance: ${cust.balance}, credit in this sale: ${creditTotal}` });
      }
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
        include: {
          items: { include: { product: { include: { taxClass: true } } } },
          payments: true,
          customer: true,
          cashier: { include: { branch: true } },
          branch: true
        }
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

      // Update loyalty points — earn + redeem
      if (customerId) {
        const pointsEarned = Math.floor(grandTotal / 1000); // 1 point per 1000 spent
        const netPoints = pointsEarned - appliedPointsRedeemed;
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: netPoints >= 0
            ? { points: { increment: netPoints } }
            : { points: { decrement: Math.abs(netPoints) } }
        });
      }

      // Update customer balance for credit payments
      if (customerId && creditPayments.length > 0) {
        const creditTotal = creditPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: { balance: { increment: creditTotal } }
        });
      }

      return s;
    });

    // Calculate commission for cashier
    let commissionEarned = 0;
    if (req.user.commissionRate > 0) {
      commissionEarned = parseFloat((grandTotal * (req.user.commissionRate / 100)).toFixed(2));
    }

    // Check for newly low-stock products and attach warnings
    const lowStockProducts = await prisma.product.findMany({
      where: {
        status: 'active',
        stockQuantity: { lte: prisma.product.fields.minimumStock }
      },
      select: { id: true, name: true, stockQuantity: true, minimumStock: true }
    });

    const itemCount = saleItems.length;
    const firstItem = saleItems[0]?.product?.name || '';
    const itemSuffix = firstItem ? ' (' + firstItem + (itemCount > 1 ? '...' : '') + ')' : '';
    const rewardsMeta = {};
    if (appliedBirthdayReward) rewardsMeta.birthdayDiscount = birthdayDiscount;
    if (appliedPointsRedeemed > 0) rewardsMeta.pointsRedeemed = appliedPointsRedeemed;
    if (commissionEarned > 0) rewardsMeta.commissionEarned = commissionEarned;
    req.audit({ action: 'create', entity: 'sale', entityId: sale.id, description: 'Sale #' + sale.id + ' — ' + itemCount + ' item(s), $' + grandTotal.toFixed(2) + itemSuffix, metadata: { total: grandTotal, itemCount, customerId: customerId || null, paymentMethods: req.body.payments ? req.body.payments.map(function(p) { return p.method; }) : [], ...rewardsMeta } });
    res.status(201).json({
      ...sale,
      rewards: { birthdayDiscount, pointsDiscount, pointsRedeemed: appliedPointsRedeemed, commissionEarned },
      warnings: lowStockProducts.length > 0 ? lowStockProducts.map(p => ({
        productId: p.id,
        name: p.name,
        stock: p.stockQuantity,
        minStock: p.minimumStock,
        message: `"${p.name}" is running low (${p.stockQuantity}/${p.minimumStock})`
      })) : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sales
router.get('/', authorize('admin', 'manager', 'cashier', 'accountant'), async (req, res) => {
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
router.get('/:id', authorize('admin', 'manager', 'cashier', 'accountant'), async (req, res) => {
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
router.put('/:id/suspend', validate.suspendSale, async (req, res) => {
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
router.put('/:id/resume', validate.resumeSale, async (req, res) => {
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
router.post('/:id/returns', validate.createReturn, async (req, res) => {
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
router.get('/returns/list', authorize('admin', 'manager', 'cashier', 'accountant'), async (req, res) => {
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
