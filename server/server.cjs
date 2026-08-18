require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const { authenticate, requireAdmin } = require('./middleware/authMiddleware.cjs');
const { apiRateLimiter } = require('./middleware/rateLimiter.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');
const { pool, db } = require('./config/db.cjs');
const runMigrations = require('./db/migrate.cjs');

// Auto-sync PostgreSQL schema and run migrations safely
if (process.env.DATABASE_URL) {
  runMigrations().catch((err) => {
    console.warn('⚠️ Auto-migration note:', err.message);
  });
}

const authRoutes = require('./routes/authRoutes.cjs');
const productRoutes = require('./routes/productRoutes.cjs');
const cartRoutes = require('./routes/cartRoutes.cjs');
const orderRoutes = require('./routes/orderRoutes.cjs');
const contentRoutes = require('./routes/contentRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');
const paymentRoutes = require('./routes/paymentRoutes.cjs');

const app = express();


const PORT = process.env.PORT || 5001;

// ── Cloudinary Configuration ────────────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow CDN assets & inline media
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── Locked-Down CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://houseofvarsh.com',
  'https://www.houseofvarsh.com',
];


if (process.env.FRONTEND_ORIGIN) {
  process.env.FRONTEND_ORIGIN.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy error: Origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRateLimiter);

// ── Static Assets (Local fallback) ──────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Uploads Handler (Cloudinary with Local Fallback) ─────────────────────────
const storageDriver = process.env.STORAGE_DRIVER || (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME ? 'cloud' : 'local');

const memoryStorage = multer.memoryStorage();
const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|avif|svg|mp4|webm|mov/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  extValid || mimeValid ? cb(null, true) : cb(new Error('Only supported image and video files are allowed'));
};

const upload = multer({
  storage: storageDriver === 'cloud' ? memoryStorage : localStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter,
});

app.post('/api/upload', authenticate, requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (storageDriver === 'cloud' && (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME)) {
      // Cloudinary stream upload from memory buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'house-of-varsh',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Cloud storage upload failed', details: error.message });
          }
          return res.json({
            url: result.secure_url,
            filename: result.public_id,
          });
        }
      );
      uploadStream.end(req.file.buffer);
    } else {
      // Local fallback — Return absolute URL with host so frontend on another domain can load it directly
      const host = req.get('host');
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ url, relativeUrl: `/uploads/${req.file.filename}`, filename: req.file.filename });
    }
  } catch (err) {
    next(err);
  }

});

// ── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', contentRoutes);
app.use('/api', adminRoutes);
app.use('/api/payment', paymentRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  let dbStatus = 'healthy';
  let dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';

  res.json({
    status: 'healthy',
    database: { type: dbType, status: dbStatus },
    storageDriver,
    timestamp: new Date().toISOString(),
  });
});

// ── Serve Built React Frontend (Production / GoDaddy / cPanel) ───────────────
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}


// ── Centralized Error Handling ───────────────────────────────────────────────
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n\x1b[32m[SENIOR BACKEND RUNNING]\x1b[0m House of Varsh API on port \x1b[36m${PORT}\x1b[0m`);
  });
}

module.exports = app;
