const authService = require('../services/authService.cjs');

const register = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.registerUser({ ...req.body, ip, userAgent });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.loginUser({ ...req.body, ip, userAgent });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.authenticateGoogle({ ...req.body, ip, userAgent });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const result = await authService.requestPasswordReset({ ...req.body, origin, ip, userAgent });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.resetPassword({ ...req.body, ip, userAgent });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};


module.exports = {
  register,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
};


