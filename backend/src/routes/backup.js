const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

router.use(authenticate);

// POST /api/backup/create — export all data as JSON
router.post('/create', authorize('admin'), async (req, res) => {
  try {
    const models = [
      'product', 'category', 'supplier', 'customer',
      'sale', 'saleItem', 'payment',
      'purchase', 'purchaseItem', 'expense',
      'stockMovement', 'tax', 'branch', 'user',
      'setting', 'attendance', 'shift', 'shiftAssignment',
      'customerPayment', 'supplierPayment', 'auditLog'
    ];

    const backup = { version: '1.0', timestamp: new Date().toISOString(), data: {} };

    for (const model of models) {
      try {
        const records = await prisma[model].findMany();
        backup.data[model] = records;
      } catch (e) {
        // Skip models that don't exist (silently)
        backup.data[model] = [];
      }
    }

    // Write to disk
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(backupDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    // Also return the data as a downloadable response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/backup/list — list available backups
router.get('/list', authorize('admin'), async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) return res.json([]);

    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const stats = fs.statSync(path.join(backupDir, f));
        return { filename: f, size: stats.size, createdAt: stats.birthtime };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/backup/restore/:filename — restore from a backup file
router.post('/restore/:filename', authorize('admin'), async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const filePath = path.join(backupDir, req.params.filename.replace(/\.\./g, '')); // prevent traversal

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const backup = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let restored = 0;

    for (const [model, records] of Object.entries(backup.data)) {
      if (!records || records.length === 0) continue;
      try {
        // Delete existing and recreate for this model
        // Skip models that don't have deleteMany (computed/read-only)
        await prisma[model].deleteMany().catch(() => {});
        for (const record of records) {
          // Remove relational auto-generated fields
          const clean = { ...record };
          delete clean.id;
          await prisma[model].create({ data: clean }).catch(() => {});
          restored++;
        }
      } catch (e) {
        // Skip models that fail
        console.warn(`[backup] Failed to restore ${model}:`, e.message);
      }
    }

    req.audit({ action: 'restore', entity: 'backup', description: `Restored ${restored} records from ${req.params.filename}` });
    res.json({ message: `Restored ${restored} records from ${req.params.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
