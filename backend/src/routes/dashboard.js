const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todaySales,
      todayTransactions,
      totalProducts,
      lowStockCount,
      topProducts,
      recentSales,
      salesChart
    ] = await Promise.all([
      // Today's sales total
      prisma.sale.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'suspended' } },
        _sum: { grandTotal: true }
      }),
      // Today's transaction count
      prisma.sale.count({
        where: { createdAt: { gte: today, lt: tomorrow }, status: { not: 'suspended' } }
      }),
      // Total active products
      prisma.product.count({ where: { status: 'active' } }),
      // Low stock count
      prisma.product.count({
        where: { status: 'active', stockQuantity: { gt: 0, lte: prisma.product.fields.minimumStock } }
      }),
      // Top selling products (last 30 days)
      prisma.saleItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        where: {
          sale: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      // Recent transactions
      prisma.sale.findMany({
        where: { status: { not: 'suspended' } },
        include: {
          cashier: { select: { name: true } },
          customer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      // Sales chart (last 7 days)
      prisma.sale.groupBy({
        by: ['createdAt'],
        _sum: { grandTotal: true },
        _count: { id: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { not: 'suspended' }
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Enrich top products with names
    const topProductsData = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, image: true }
        });
        return { ...product, quantitySold: tp._sum.quantity, totalRevenue: tp._sum.total };
      })
    );

    res.json({
      todaySales: todaySales._sum.grandTotal || 0,
      todayTransactions,
      totalProducts,
      lowStockCount,
      topProducts: topProductsData,
      recentSales,
      salesChart: salesChart.map(s => ({
        date: s.createdAt.toISOString().slice(0, 10),
        total: s._sum.grandTotal,
        count: s._count.id
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
