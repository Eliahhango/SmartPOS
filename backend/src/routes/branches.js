const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);

// GET /api/branches
router.get('/', authorize('admin', 'accountant'), async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: { _count: { select: { users: true } } }
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/branches
router.post('/', authorize('admin'), validate.createBranch, async (req, res) => {
  try {
    const { name, address, phone, isMainBranch } = req.body;

    const branch = await prisma.branch.create({
      data: { name, address, phone, isMainBranch: isMainBranch || false }
    });
    res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/branches/:id
router.put('/:id', authorize('admin'), validate.updateBranch, async (req, res) => {
  try {
    const { name, address, phone, isMainBranch } = req.body;
    const data = {};
    if (name) data.name = name;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (isMainBranch !== undefined) data.isMainBranch = isMainBranch;

    const branch = await prisma.branch.update({
      where: { id: parseInt(req.params.id) },
      data
    });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
