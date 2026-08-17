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

module.exports = {
  registerUser,
  loginUser,
  authenticateGoogle,
  logAudit,
};
