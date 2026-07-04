const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 50 } = req.query;
    const where = {};
    if (type) where.expenseType = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { branch: true },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({ expenses, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/expenses
router.post('/', authorize('admin', 'manager'), validate.createExpense, async (req, res) => {
  try {
    const { expenseType, amount, description, date } = req.body;

    const expense = await prisma.expense.create({
      data: {
        expenseType,
        amount: parseFloat(amount),
        description,
        branchId: req.user.branchId,
        date: date ? new Date(date) : new Date()
      }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', authorize('admin', 'manager'), validate.updateExpense, async (req, res) => {
  try {
    const { expenseType, amount, description, date } = req.body;
    const data = {};
    if (expenseType) data.expenseType = expenseType;
    if (amount) data.amount = parseFloat(amount);
    if (description !== undefined) data.description = description;
    if (date) data.date = new Date(date);

    const expense = await prisma.expense.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', authorize('admin'), validate.deleteExpense, async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
