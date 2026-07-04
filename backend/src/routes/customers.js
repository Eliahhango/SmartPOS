const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { _count: { select: { sales: true } } },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({ customers, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { sales: { include: { items: { include: { product: true } }, payments: true } } }
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customers
router.post('/', validate.createCustomer, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = await prisma.customer.create({
      data: { name, phone, email, address, points: 0, balance: 0, creditLimit: 0 }
    });
    req.audit({ action: 'create', entity: 'customer', entityId: customer.id, description: 'Created customer "' + customer.name + '"' });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', validate.updateCustomer, async (req, res) => {
  try {
    const { name, phone, email, address, points, creditLimit, birthday } = req.body;
    const data = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (points !== undefined) data.points = parseInt(points);
    if (creditLimit !== undefined) data.creditLimit = parseFloat(creditLimit);
    if (birthday !== undefined) data.birthday = new Date(birthday);

    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    req.audit({ action: 'update', entity: 'customer', entityId: customer.id, description: 'Updated customer "' + customer.name + '"' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/customers/:id/payments — record a payment against customer credit
router.post('/:id/payments', authorize('admin', 'manager', 'cashier'), async (req, res) => {
  try {
    const { amount, method, referenceNo, notes, saleId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount must be > 0' });

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const payment = await prisma.$transaction(async (tx) => {
      // Reduce customer balance (they're paying off debt)
      await tx.customer.update({
        where: { id: parseInt(req.params.id) },
        data: { balance: { decrement: parseFloat(amount) } }
      });

      return tx.customerPayment.create({
        data: {
          customerId: parseInt(req.params.id),
          amount: parseFloat(amount),
          method: method || 'cash',
          referenceNo: referenceNo || null,
          notes: notes || null,
          saleId: saleId ? parseInt(saleId) : null
        }
      });
    });

    req.audit({ action: 'create', entity: 'customer', entityId: customer.id, description: 'Payment of $' + amount + ' received from "' + customer.name + '"', metadata: { amount: parseFloat(amount), method } });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/customers/:id/payments — payment history
router.get('/:id/payments', async (req, res) => {
  try {
    const payments = await prisma.customerPayment.findMany({
      where: { customerId: parseInt(req.params.id) },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
