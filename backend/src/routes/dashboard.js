const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      todaySales,
      todayTransactions,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalCustomers,
      monthSales,
      monthTransactions,
      topProducts,
      recentSales,
      salesChart,
      revenueByDay,
      paymentBreakdown,
      expiringCount
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'suspended' } },
        _sum: { grandTotal: true, discount: true, taxTotal: true }
      }),
      prisma.sale.count({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'suspended' } }
      }),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.product.count({
        where: { status: 'active', stockQuantity: { gt: 0, lte: prisma.product.fields.minimumStock } }
      }),
      prisma.product.count({ where: { status: 'active', stockQuantity: 0 } }),
      prisma.customer.count(),
      prisma.sale.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'suspended' } },
        _sum: { grandTotal: true }
      }),
      prisma.sale.count({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'suspended' } }
      }),
      prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        where: { sale: { createdAt: { gte: thirtyDaysAgo } } },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      prisma.sale.findMany({
        where: { status: { not: 'suspended' } },
        include: {
          cashier: { select: { name: true } },
          customer: { select: { name: true } },
          items: { select: { quantity: true } },
          payments: { select: { method: true, amount: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 8
      }),
      prisma.sale.groupBy({
        by: ['createdAt'],
        _sum: { grandTotal: true },
        _count: { id: true },
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'suspended' } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.sale.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, status: { not: 'suspended' } },
        select: { createdAt: true, grandTotal: true }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        where: { sale: { createdAt: { gte: thirtyDaysAgo } } }
      }),
      prisma.product.count({
        where: { status: 'active', expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
      })
    ]);

    const topProductsData = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, image: true, category: { select: { name: true } } }
        });
        return { ...product, quantitySold: tp._sum.quantity, totalRevenue: tp._sum.total };
      })
    );

    // Build 7-day chart with zero-fill
    const chartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartMap[d.toISOString().slice(0, 10)] = { total: 0, count: 0 };
    }
    salesChart.forEach(s => {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (chartMap[key] !== undefined) {
        chartMap[key] = { total: s._sum.grandTotal || 0, count: s._count.id };
      }
    });

    // Revenue trend (daily for 7 days)
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap[d.toISOString().slice(0, 10)] = 0;
    }
    revenueByDay.forEach(s => {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (trendMap[key] !== undefined) trendMap[key] += s.grandTotal;
    });

    // Payment method breakdown
    const paymentMethods = { cash: 0, mobile_money: 0, card: 0, bank: 0 };
    paymentBreakdown.forEach(p => { paymentMethods[p.method] = p._sum.amount || 0; });

    // Average transaction value
    const avgTransaction = todayTransactions > 0
      ? (todaySales._sum.grandTotal || 0) / todayTransactions
      : 0;

    res.json({
      todaySales: todaySales._sum.grandTotal || 0,
      todayDiscount: todaySales._sum.discount || 0,
      todayTax: todaySales._sum.taxTotal || 0,
      todayTransactions,
      avgTransaction,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      totalCustomers,
      monthSales: monthSales._sum.grandTotal || 0,
      monthTransactions,
      topProducts: topProductsData,
      recentSales,
      salesChart: Object.entries(chartMap).map(([date, val]) => ({ date, ...val })),
      revenueTrend: Object.entries(trendMap).map(([date, total]) => ({ date, total })),
      paymentBreakdown: [
        { method: 'Cash', amount: paymentMethods.cash, color: '#10b981' },
        { method: 'Mobile Money', amount: paymentMethods.mobile_money, color: '#3b82f6' },
        { method: 'Card', amount: paymentMethods.card, color: '#8b5cf6' },
        { method: 'Bank', amount: paymentMethods.bank, color: '#f59e0b' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
