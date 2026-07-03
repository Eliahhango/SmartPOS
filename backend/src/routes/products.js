const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.use(authenticate);

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, category, status, lowStock, page = 1, limit = 50 } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { barcode: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    if (category) where.categoryId = parseInt(category);
    if (status) where.status = status;
    if (lowStock === 'true') {
      where.stockQuantity = { lte: prisma.product.fields.minimumStock };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, supplier: true, taxClass: true },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, supplier: true, taxClass: true }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate product numeric fields against negative values
function validateProductFields(data, isUpdate = false) {
  const errors = [];
  if (data.costPrice !== undefined) {
    const val = parseFloat(data.costPrice);
    if (isNaN(val) || val < 0) errors.push('costPrice must be a non-negative number');
    data.costPrice = val;
  }
  if (data.sellingPrice !== undefined) {
    const val = parseFloat(data.sellingPrice);
    if (isNaN(val) || val < 0) errors.push('sellingPrice must be a non-negative number');
    data.sellingPrice = val;
  }
  if (data.stockQuantity !== undefined) {
    const val = parseInt(data.stockQuantity);
    if (isNaN(val) || val < 0) errors.push('stockQuantity must be a non-negative integer');
    data.stockQuantity = val;
  }
  if (data.minimumStock !== undefined) {
    const val = parseInt(data.minimumStock);
    if (isNaN(val) || val < 0) errors.push('minimumStock must be a non-negative integer');
    data.minimumStock = val;
  }
  if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length < 1)) {
    errors.push('name is required');
  }
  return errors;
}

// POST /api/products
router.post('/', authorize('admin', 'manager', 'stock_officer'), upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    // Input validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 1) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    data.name = data.name.trim();

    const numericErrors = validateProductFields(data);
    if (numericErrors.length > 0) {
      return res.status(400).json({ error: numericErrors.join('; ') });
    }

    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.supplierId) data.supplierId = parseInt(data.supplierId);
    if (data.taxClassId) data.taxClassId = parseInt(data.taxClassId);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const product = await prisma.product.create({
      data,
      include: { category: true, supplier: true, taxClass: true }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authorize('admin', 'manager', 'stock_officer'), upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    // Validate numeric fields
    const numericErrors = validateProductFields(data, true);
    if (numericErrors.length > 0) {
      return res.status(400).json({ error: numericErrors.join('; ') });
    }

    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.supplierId) data.supplierId = parseInt(data.supplierId);
    if (data.taxClassId) data.taxClassId = parseInt(data.taxClassId);
    if (data.costPrice) data.costPrice = parseFloat(data.costPrice);
    if (data.sellingPrice) data.sellingPrice = parseFloat(data.sellingPrice);
    if (data.stockQuantity) data.stockQuantity = parseInt(data.stockQuantity);
    if (data.minimumStock) data.minimumStock = parseInt(data.minimumStock);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { category: true, supplier: true, taxClass: true }
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'discontinued' }
    });
    res.json({ message: 'Product discontinued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/import
router.post('/import', authorize('admin', 'manager'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Excel file required' });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const results = { created: 0, errors: [] };
    for (const row of rows) {
      try {
        await prisma.product.create({
          data: {
            name: row.name || row.Name,
            barcode: row.barcode || row.Barcode || null,
            sku: row.sku || row.SKU || null,
            costPrice: parseFloat(row.cost_price || row.costPrice || 0),
            sellingPrice: parseFloat(row.selling_price || row.sellingPrice || 0),
            stockQuantity: parseInt(row.stock_quantity || row.stockQuantity || 0),
            minimumStock: parseInt(row.minimum_stock || row.minimumStock || 0),
            unit: row.unit || 'pcs'
          }
        });
        results.created++;
      } catch (e) {
        results.errors.push({ row: row.name || 'Unknown', error: e.message });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
