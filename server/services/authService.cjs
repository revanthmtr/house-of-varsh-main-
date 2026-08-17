const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { queryGet, queryRun } = require('../config/db.cjs');
const { SECRET } = require('../middleware/authMiddleware.cjs');

const GOOGLE_CLIENT_IDS = [
  process.env.GOOGLE_CLIENT_ID,
  '118817308805-sehbo62sknilfkeht45m04252rfrevq9.apps.googleusercontent.com',
  '303025946632-vih404g8jdfgs09rsvfbjnt80d5argia.apps.googleusercontent.com',
].filter(Boolean);

const googleClient = new OAuth2Client();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'revanthmtr@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const resolveRole = (email) => (ADMIN_EMAILS.includes((email || '').toLowerCase()) ? 'admin' : 'user');

const logAudit = async ({ email, action, ip, userAgent, status = 'success', details = null }) => {
  try {
    await queryRun(
      `INSERT INTO audit_logs (email, action, ip_address, user_agent, status, details) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, action, ip, userAgent, status, details]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

const registerUser = async ({ name, email, password, ip, userAgent }) => {
  if (!name || !email || !password) {
    throw { status: 400, message: 'All fields (name, email, password) are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await queryGet('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
  if (existing) {
    await logAudit({ email: normalizedEmail, action: 'Register Failed', ip, userAgent, status: 'failed', details: 'Email already exists' });
    throw { status: 400, message: 'Email already registered.' };
  }

  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);
  const role = resolveRole(normalizedEmail);
  const result = await queryRun(
    `INSERT INTO users (name, email, password, role, last_login, login_count, last_ip, last_device, auth_method) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [name, normalizedEmail, hash, role, now, ip, userAgent, 'email']
  );

  await logAudit({ email: normalizedEmail, action: 'Account Registered', ip, userAgent, status: 'success', details: `Role: ${role}` });
  const user = { id: result.lastID, name, email: normalizedEmail, role };
  const token = jwt.sign(user, SECRET, { expiresIn: '7d' });
  return { token, user };
};

const loginUser = async ({ email, password, ip, userAgent }) => {
  if (!email || !password) {
    throw { status: 400, message: 'Email and password are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryGet('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
  if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
    await logAudit({ email: normalizedEmail, action: 'Email Login Failed', ip, userAgent, status: 'failed', details: 'Invalid credentials' });
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const now = new Date().toISOString();
  await queryRun(
    `UPDATE users SET last_login=?, login_count=COALESCE(login_count,0)+1, last_ip=?, last_device=?, auth_method='email' WHERE id=?`,
    [now, ip, userAgent, user.id]
  );

  await logAudit({ email: normalizedEmail, action: 'Email Login Success', ip, userAgent, status: 'success', details: `Role: ${user.role}` });
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
  return { token, user: payload };
};

const authenticateGoogle = async ({ credential, ip, userAgent }) => {
  if (!credential) throw { status: 400, message: 'Credential payload is required.' };

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_IDS,
    });
    payload = ticket.getPayload();
  } catch (verifyErr) {
    console.error('[GOOGLE AUTH VERIFICATION ERROR]', verifyErr);
    throw { status: 401, message: `Google authentication verification failed: ${verifyErr.message}` };
  }

  const { sub: google_id, email, name } = payload;
  const normalizedEmail = (email || '').trim().toLowerCase();
  const now = new Date().toISOString();

  let user = await queryGet('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);

  if (user) {
    const shouldBeAdmin = resolveRole(normalizedEmail) === 'admin' && user.role !== 'admin';
    await queryRun(
      `UPDATE users SET google_id=COALESCE(google_id,?), last_login=?, login_count=COALESCE(login_count,0)+1, last_ip=?, last_device=?, auth_method='google'${shouldBeAdmin ? ", role='admin'" : ''} WHERE id=?`,
      [google_id, now, ip, userAgent, user.id]
    );
    if (shouldBeAdmin) user.role = 'admin';
    await logAudit({ email: normalizedEmail, action: 'Google Login Success', ip, userAgent, status: 'success', details: `Role: ${user.role}` });
  } else {
    const assignRole = resolveRole(normalizedEmail);
    const result = await queryRun(
      `INSERT INTO users (name, email, google_id, role, created_at, last_login, login_count, last_ip, last_device, auth_method) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [name || 'Guest User', normalizedEmail, google_id, assignRole, now, now, ip, userAgent, 'google']
    );
    user = { id: result.lastID, name: name || 'Guest User', email: normalizedEmail, role: assignRole };
    await logAudit({ email: normalizedEmail, action: 'Google Register & Login', ip, userAgent, status: 'success', details: `New ${assignRole} account` });
  }

  const userPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(userPayload, SECRET, { expiresIn: '7d' });
  return { token, user: userPayload };
};

const crypto = require('crypto');
const { sendPasswordResetEmail } = require('./mailService.cjs');

const requestPasswordReset = async ({ email, origin, ip, userAgent }) => {
  if (!email) {
    throw { status: 400, message: 'Email address is required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await queryGet('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);

  if (user) {
    // Generate 32-byte high-entropy token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes validity

    await queryRun(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [hashedToken, expiresAt, user.id]
    );

    const baseUrl = (origin || process.env.FRONTEND_URL || 'https://houseofvarsh.com').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/?reset_token=${rawToken}`;

    await sendPasswordResetEmail({
      to: normalizedEmail,
      resetUrl,
      clientName: user.name,
    });

    await logAudit({
      email: normalizedEmail,
      action: 'Password Reset Requested',
      ip,
      userAgent,
      status: 'success',
      details: 'Reset token dispatched'
    });
  } else {
    await logAudit({
      email: normalizedEmail,
      action: 'Password Reset Probed',
      ip,
      userAgent,
      status: 'failed',
      details: 'Email not found in database'
    });
  }

  // Consistent message returned always (OWASP anti-enumeration standard)
  return {
    success: true,
    message: 'If an account exists with this email address, a password reset link has been dispatched to your inbox.'
  };
};

const resetPassword = async ({ token, newPassword, ip, userAgent }) => {
  if (!token) {
    throw { status: 400, message: 'Reset token is required.' };
  }
  if (!newPassword || newPassword.length < 6) {
    throw { status: 400, message: 'New password must be at least 6 characters in length.' };
  }

  const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const nowIso = new Date().toISOString();

  // Find user by hashed token and verify non-expired
  const user = await queryGet(
    'SELECT * FROM users WHERE reset_password_token = ?',
    [hashedToken]
  );

  if (!user || !user.reset_password_expires) {
    await logAudit({ email: 'unknown', action: 'Password Reset Failed', ip, userAgent, status: 'failed', details: 'Token not found' });
    throw { status: 400, message: 'Password reset link is invalid. Please request a new one.' };
  }

  const expiryTime = new Date(user.reset_password_expires).getTime();
  if (Date.now() > expiryTime) {
    await logAudit({ email: user.email, action: 'Password Reset Expired', ip, userAgent, status: 'failed', details: 'Token expired' });
    throw { status: 400, message: 'This password reset link has expired. Please request a fresh reset link.' };
  }

  const newHash = bcrypt.hashSync(newPassword, 10);

  await queryRun(
    `UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL, last_login = ?, last_ip = ?, last_device = ?, auth_method = 'email' WHERE id = ?`,
    [newHash, nowIso, ip, userAgent, user.id]
  );

  await logAudit({
    email: user.email,
    action: 'Password Reset Success',
    ip,
    userAgent,
    status: 'success',
    details: 'Password updated and user authenticated'
  });

  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const freshToken = jwt.sign(payload, SECRET, { expiresIn: '7d' });

  return {
    success: true,
    message: 'Your password has been successfully updated.',
    token: freshToken,
    user: payload,
  };
};

module.exports = {
  registerUser,
  loginUser,
  authenticateGoogle,
  requestPasswordReset,
  resetPassword,
  logAudit,
};

