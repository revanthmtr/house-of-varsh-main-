const multer = require('multer');

const errorHandler = (err, req, res, _next) => {
  console.error('[BACKEND ERROR]', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds maximum 10MB limit.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || (statusCode === 500 ? 'An unexpected server error occurred. Please try again.' : 'Request failed');

  res.status(statusCode).json({ error: message, details: process.env.NODE_ENV === 'development' ? err.stack : undefined });
};


module.exports = errorHandler;
