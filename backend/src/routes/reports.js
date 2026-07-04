const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/reports/sales
router.get('/sales', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = { gte: new Date(startDate), lte: new Date(endDate) };
    } else {
      switch (period) {
        case 'daily':
          dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
          break;
        case 'weekly':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter = { gte: weekAgo };
          break;
        case 'monthly':
          dateFilter = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
          break;
        case 'annual':
          dateFilter = { gte: new Date(now.getFullYear(), 0, 1) };
          break;
      }
    }

    const sales = await prisma.sale.findMany({
      where: { createdAt: dateFilter, status: { not: 'suspended' } },
      include: {
        items: { include: { product: true } },
        payments: true,
        cashier: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.grandTotal), 0);
    const totalTransactions = sales.length;
    const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((s2, i) => s2 + i.quantity, 0), 0);

    res.json({
      period,
      totalSales,
      totalTransactions,
      totalItems,
      averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      sales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/inventory
router.get('/inventory', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const [totalProducts, lowStock, outOfStock, expiringSoon] = await Promise.all([
      prisma.product.count({ where: { status: 'active' } }),
      prisma.product.count({
        where: { status: 'active', stockQuantity: { gt: 0, lte: prisma.product.fields.minimumStock } }
      }),
      prisma.product.count({ where: { status: 'active', stockQuantity: 0 } }),
      prisma.product.count({
        where: {
          status: 'active',
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const stockValue = await prisma.product.aggregate({
      where: { status: 'active' },
      _sum: { stockQuantity: true },
      _avg: { costPrice: true }
    });

    res.json({
      totalProducts,
      lowStock,
      outOfStock,
      expiringSoon,
      totalStockQuantity: stockValue._sum.stockQuantity || 0,
      estimatedStockValue: (stockValue._sum.stockQuantity || 0) * (stockValue._avg.costPrice || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/financial
router.get('/financial', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [sales, expenses] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: dateFilter, status: { not: 'suspended' } },
        _sum: { grandTotal: true, taxTotal: true, discount: true }
      }),
      prisma.expense.aggregate({
        where: { date: dateFilter },
        _sum: { amount: true }
      })
    ]);

    const revenue = sales._sum.grandTotal || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const profit = parseFloat(revenue) - parseFloat(totalExpenses);

    res.json({
      revenue: parseFloat(revenue),
      expenses: parseFloat(totalExpenses),
      profit,
      taxCollected: sales._sum.taxTotal || 0,
      discountsGiven: sales._sum.discount || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/cashier
router.get('/cashier', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const cashiers = await prisma.user.findMany({
      where: { role: 'cashier' },
      select: {
        id: true,
        name: true,
        _count: { select: { sales: { where: { createdAt: dateFilter } } } },
        sales: {
          where: { createdAt: dateFilter },
          select: { grandTotal: true }
        }
      }
    });

    const result = cashiers.map(c => ({
      id: c.id,
      name: c.name,
      totalSales: c._count.sales,
      totalAmount: c.sales.reduce((sum, s) => sum + parseFloat(s.grandTotal), 0)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/cash-flow
router.get('/cash-flow', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    } else {
      dateFilter.gte = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [payments, expenses, customerPayments] = await Promise.all([
      prisma.payment.findMany({
        where: { sale: { createdAt: dateFilter, status: { not: 'suspended' } } },
        include: { sale: { select: { createdAt: true } } }
      }),
      prisma.expense.findMany({ where: { date: dateFilter } }),
      prisma.customerPayment.findMany({ where: { createdAt: dateFilter } })
    ]);

    const inflow = { cash: 0, mobile_money: 0, card: 0, bank: 0, credit: 0, customerPayments: 0, total: 0 };
    payments.forEach(p => {
      const amt = parseFloat(p.amount);
      if (inflow[p.method] !== undefined) inflow[p.method] += amt;
      inflow.total += amt;
    });

    customerPayments.forEach(cp => {
      const amt = parseFloat(cp.amount);
      inflow.customerPayments += amt;
      inflow.total += amt;
    });

    const outflow = { expenses: 0, total: 0 };
    expenses.forEach(e => {
      const amt = parseFloat(e.amount);
      outflow.expenses += amt;
      outflow.total += amt;
    });

    const dailyMap = {};
    payments.forEach(p => {
      const d = p.sale.createdAt.toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { inflow: 0, outflow: 0, net: 0 };
      dailyMap[d].inflow += parseFloat(p.amount);
    });
    customerPayments.forEach(cp => {
      const d = cp.createdAt.toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { inflow: 0, outflow: 0, net: 0 };
      dailyMap[d].inflow += parseFloat(cp.amount);
    });
    expenses.forEach(e => {
      const d = e.date.toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { inflow: 0, outflow: 0, net: 0 };
      dailyMap[d].outflow += parseFloat(e.amount);
    });

    const dailyBreakdown = Object.entries(dailyMap)
      .map(([date, v]) => ({ date, ...v, net: v.inflow - v.outflow }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalInflow = Object.values(inflow).reduce((s, v) => typeof v === 'number' ? s + v : s, 0);
    const totalOutflow = outflow.total;
    const netFlow = totalInflow - totalOutflow;

    res.json({
      startDate: dateFilter.gte?.toISOString() || null,
      endDate: dateFilter.lte?.toISOString() || null,
      inflows: inflow,
      outflows: outflow,
      netFlow,
      dailyBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/dead-stock
router.get('/dead-stock', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        stockQuantity: { gt: 0 },
        stockMovements: { none: { createdAt: { gte: cutoff } } }
      },
      include: {
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } }
      }
    });

    const result = products.map(p => {
      const lastMovement = p.stockMovements[0]?.createdAt || null;
      return {
        id: p.id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        lastMovementDate: lastMovement,
        daysSinceLastMovement: lastMovement
          ? Math.floor((Date.now() - new Date(lastMovement).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        totalValue: p.stockQuantity * p.costPrice
      };
    });

    const totalValue = result.reduce((s, p) => s + p.totalValue, 0);

    res.json({ days, products: result, totalValue, count: result.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/customers
router.get('/customers', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const totalCustomers = await prisma.customer.count();

    const allCustomers = await prisma.customer.findMany({
      include: {
        sales: {
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: { grandTotal: true, createdAt: true },
          orderBy: { createdAt: 'asc' }
        },
        _count: { select: { sales: true } }
      }
    });

    let newCustomers = 0;
    let retainedCustomers = 0;
    let activeInPeriod = 0;

    const topCustomers = allCustomers
      .map(c => {
        const totalSpent = c.sales.reduce((s, sl) => s + parseFloat(sl.grandTotal), 0);
        return { id: c.id, name: c.name, totalSales: c.sales.length, totalSpent };
      })
      .filter(c => c.totalSales > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    if (dateFilter.gte) {
      allCustomers.forEach(c => {
        const salesInPeriod = c.sales.filter(s => new Date(s.createdAt) >= dateFilter.gte && (!dateFilter.lte || new Date(s.createdAt) <= dateFilter.lte));
        if (salesInPeriod.length > 0) {
          activeInPeriod++;
          if (salesInPeriod.length > 1) retainedCustomers++;
          const firstSaleOverall = c._count.sales === salesInPeriod.length;
          if (firstSaleOverall) newCustomers++;
        }
      });
    }

    const repeatRate = activeInPeriod > 0 ? (retainedCustomers / activeInPeriod) * 100 : 0;

    res.json({
      totalCustomers,
      newCustomers,
      repeatRate: Math.round(repeatRate * 100) / 100,
      topCustomers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/suppliers
router.get('/suppliers', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const totalSuppliers = await prisma.supplier.count();

    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          where: { date: dateFilter },
          select: { totalAmount: true, date: true }
        }
      }
    });

    const topSuppliers = suppliers
      .map(s => ({
        id: s.id,
        name: s.name,
        totalPurchases: s.purchases.length,
        totalAmount: s.purchases.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0)
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 20);

    const totalPurchaseVolume = topSuppliers.reduce((s, su) => s + su.totalAmount, 0);

    res.json({ totalSuppliers, topSuppliers, totalPurchaseVolume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/category-sales
router.get('/category-sales', authorize('admin', 'manager', 'accountant'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate);
      dateFilter.lte = new Date(endDate);
    } else {
      dateFilter.gte = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (startDate && !endDate) dateFilter.gte = new Date(startDate);
    if (!startDate && endDate) dateFilter.lte = new Date(endDate);

    const saleItems = await prisma.saleItem.findMany({
      where: { sale: { createdAt: dateFilter, status: { not: 'suspended' } } },
      include: { product: { include: { category: true } } }
    });

    const catMap = {};
    let overallTotal = 0;

    saleItems.forEach(item => {
      const catName = item.product.category?.name || 'Uncategorized';
      if (!catMap[catName]) catMap[catName] = { name: catName, totalSales: 0, itemCount: 0 };
      catMap[catName].totalSales += parseFloat(item.total);
      catMap[catName].itemCount += item.quantity;
      overallTotal += parseFloat(item.total);
    });

    const categories = Object.values(catMap).map(c => ({
      ...c,
      percentage: overallTotal > 0 ? Math.round((c.totalSales / overallTotal) * 10000) / 100 : 0
    }));

    res.json({
      categories,
      totalSales: overallTotal,
      startDate: dateFilter.gte?.toISOString() || null,
      endDate: dateFilter.lte?.toISOString() || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
