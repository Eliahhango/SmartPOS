const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'public', 'uploads')),
  filename: (req, file, cb) => cb(null, 'logo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + path.extname(file.originalname))
});

const uploadLogo = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid image type. Allowed: JPEG, PNG, GIF, WebP'));
  }
});

router.use(authenticate);

async function getSetting(key) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? setting.value : null;
}

async function setSetting(key, value) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

router.post('/logo', authorize('admin'), uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Logo image required' });
    const filePath = '/uploads/' + req.file.filename;
    await setSetting('company_logo', filePath);
    res.json({ logo: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/logo', async (req, res) => {
  try {
    const logo = await getSetting('company_logo');
    res.json({ logo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/logo', authorize('admin'), async (req, res) => {
  try {
    await prisma.setting.delete({ where: { key: 'company_logo' } }).catch(() => {});
    res.json({ logo: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', authorize('admin'), async (req, res) => {
  try {
    const allowedKeys = ['company_name', 'company_address', 'company_phone', 'company_email', 'receipt_footer'];
    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        await setSetting(key, String(req.body[key]));
      }
    }
    const settings = await prisma.setting.findMany();
    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
