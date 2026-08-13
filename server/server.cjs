require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { authenticate, requireAdmin } = require('./middleware/authMiddleware.cjs');
const { apiRateLimiter } = require('./middleware/rateLimiter.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');

const authRoutes = require('./routes/authRoutes.cjs');
const productRoutes = require('./routes/productRoutes.cjs');
const cartRoutes = require('./routes/cartRoutes.cjs');
const orderRoutes = require('./routes/orderRoutes.cjs');
const contentRoutes = require('./routes/contentRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline assets & media in dev
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

// ── Static Assets ────────────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Uploads Handler ──────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|avif|svg|mp4|webm|mov/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype.split('/')[1]);
    ok ? cb(null, true) : cb(new Error('Only supported image/video files are allowed'));
  },
});

app.post('/api/upload', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// ── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', contentRoutes);
app.use('/api', adminRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', architecture: 'Senior Layered Express', timestamp: new Date().toISOString() });
});

// Centralized Error Handling
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n\x1b[32m[SENIOR BACKEND RUNNING]\x1b[0m House of Varsh API on port \x1b[36m${PORT}\x1b[0m`);
  });
}

module.exports = app;
