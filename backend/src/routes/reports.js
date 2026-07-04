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

module.exports = router;
