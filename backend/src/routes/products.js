const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;  // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + path.extname(file.originalname))
});

const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP'));
  }
});

const uploadDoc = multer({
  storage,
  limits: { fileSize: MAX_DOC_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_DOC_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed'));
  }
});

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

// POST /api/products
router.post('/', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), validate.createProduct, uploadImage.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.supplierId) data.supplierId = parseInt(data.supplierId);
    if (data.taxClassId) data.taxClassId = parseInt(data.taxClassId);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const product = await prisma.product.create({
      data,
      include: { category: true, supplier: true, taxClass: true }
    });

    req.audit({ action: 'create', entity: 'product', entityId: product.id, description: `Created product "${product.name}"`, metadata: { barcode: product.barcode, sellingPrice: product.sellingPrice } });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', authorize('admin', 'manager', 'stock_officer', 'store_keeper'), validate.updateProduct, uploadImage.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);
    if (data.supplierId) data.supplierId = parseInt(data.supplierId);
    if (data.taxClassId) data.taxClassId = parseInt(data.taxClassId);
    if (data.costPrice) data.costPrice = parseFloat(data.costPrice);
    if (data.sellingPrice) data.sellingPrice = parseFloat(data.sellingPrice);
    if (data.stockQuantity) data.stockQuantity = parseInt(data.stockQuantity);
    if (data.minimumStock) data.minimumStock = parseInt(data.minimumStock);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    const previous = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { category: true, supplier: true, taxClass: true }
    });

    const changes = [];
    if (previous && previous.sellingPrice !== product.sellingPrice) changes.push(`price: ${previous.sellingPrice}→${product.sellingPrice}`);
    if (previous && previous.costPrice !== product.costPrice) changes.push(`cost: ${previous.costPrice}→${product.costPrice}`);
    if (previous && previous.stockQuantity !== product.stockQuantity) changes.push(`stock: ${previous.stockQuantity}→${product.stockQuantity}`);
    req.audit({ action: 'update', entity: 'product', entityId: product.id, description: `Updated product "${product.name}"${changes.length ? ': ' + changes.join(', ') : ''}`, metadata: { before: { sellingPrice: previous?.sellingPrice, costPrice: previous?.costPrice, stockQuantity: previous?.stockQuantity }, after: { sellingPrice: product.sellingPrice, costPrice: product.costPrice, stockQuantity: product.stockQuantity } } });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authorize('admin'), validate.discontinueProduct, async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'discontinued' }
    });
    req.audit({ action: 'delete', entity: 'product', entityId: parseInt(req.params.id), description: `Discontinued product "${product.name}"` });
    res.json({ message: 'Product discontinued' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/import
router.post('/import', authorize('admin', 'manager'), uploadDoc.single('file'), async (req, res) => {
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
