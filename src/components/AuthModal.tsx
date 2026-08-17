import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff, ArrowLeft, MailCheck } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';
import './AuthModal.css';

type Mode = 'login' | 'register' | 'forgot_password' | 'reset_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();

  const [mode, setMode]                     = useState<Mode>('login');
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]= useState('');
  const [resetToken, setResetToken]         = useState('');
  const [showPwd, setShowPwd]               = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [gLoading, setGLoading]             = useState(false);
  const [success, setSuccess]               = useState('');
  const [forgotSent, setForgotSent]         = useState(false);

  // Auto-detect reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset_password');
    }
  }, []);

  const reset = () => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setError(''); setSuccess(''); setLoading(false); setGLoading(false);
    setForgotSent(false);
  };

  const switchMode = (m: Mode) => { reset(); setMode(m); };

  const handleSuccess = (token: string, user: any, greeting: string) => {
    setSuccess(greeting);
    // Remove query params if we were in reset password mode
    if (window.location.search.includes('reset_token')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setTimeout(() => { login(token, user); onClose(); reset(); }, 1000);
  };

  // ── Form Submissions ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Handle Forgot Password
    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || 'Failed to dispatch reset request.');
        setForgotSent(true);
      } catch (err: any) {
        setError(err.message || 'Unable to connect to authentication server.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Reset Password (from email link)
    if (mode === 'reset_password') {
      if (!password || password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
      if (!resetToken) {
        setError('Reset token is missing or invalid.');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ token: resetToken, newPassword: password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || 'Failed to reset password.');
        handleSuccess(data.token, data.user, 'Password updated! Welcome back to House of Varsh.');
      } catch (err: any) {
        setError(err.message || 'Password reset failed or token has expired.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Login / Register
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: any = { email: email.trim().toLowerCase(), password };
      if (mode === 'register') body.name = name.trim();

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Authentication error (${res.status})`);
      }

      handleSuccess(data.token, data.user,
        mode === 'register' ? `Welcome, ${data.user?.name || data.user?.email || 'Valued Client'}!` : `Welcome back, ${data.user?.name || data.user?.email || 'Valued Client'}!`
      );
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ──
  const handleGoogleCredential = useCallback(async (credentialResponse: any) => {
    setError(''); setGLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error('Google sign-in did not return a credential.');
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Google authentication verification failed.');
      }

      handleSuccess(data.token, data.user, `Welcome, ${data.user?.name || data.user?.email || 'Valued Client'}!`);
    } catch (err: any) {
      setError(err.message || 'Google sign-in connection failed. Please try again.');
    } finally {
      setGLoading(false);
    }
  }, []);

  const isLoading = loading || gLoading;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => { if (e.target === e.currentTarget && !isLoading) onClose(); }}
        >
          <motion.div
            className="auth-modal"
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.45 }}
          >
            {/* Gold bar */}
            <div className="auth-topbar" />

            {/* Close */}
            {!isLoading && (
              <button className="auth-close" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            )}

            {/* Brand */}
            <div className="auth-brand">
              <img src="/chinni_logo.png" alt="House of Varsh" className="auth-logo-img" style={{ height: '36px', marginBottom: '0.8rem' }} />
              <h2 className="auth-title">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot_password' && 'Reset Password'}
                {mode === 'reset_password' && 'Set New Password'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login' && 'Sign in to access your exclusive collection and wishlist.'}
                {mode === 'register' && 'Join House of Varsh for a curated luxury experience.'}
                {mode === 'forgot_password' && "Enter your registered email address and we'll dispatch a private reset link."}
                {mode === 'reset_password' && 'Choose a strong, new password for your House of Varsh atelier account.'}
              </p>
            </div>

            {/* Mode tabs (only for login / register) */}
            {(mode === 'login' || mode === 'register') && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => switchMode('login')}
                  type="button"
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => switchMode('register')}
                  type="button"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Success Notification */}
            <AnimatePresence>
              {success && (
                <motion.div className="auth-success"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="auth-success-icon">✓</span>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Notification */}
            <AnimatePresence>
              {error && !success && (
                <motion.div className="auth-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!success && (
              <>
                {/* ── FORGOT PASSWORD SENT STATE ── */}
                {mode === 'forgot_password' && forgotSent ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', color: '#BFA15F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <MailCheck size={26} />
                    </div>
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.15rem', color: '#121212', marginBottom: '0.6rem' }}>Reset Link Dispatched</h3>
                    <p className="auth-notice-card">
                      If an account is associated with <strong>{email}</strong>, you will receive a secure password reset link in your inbox shortly. The link expires in 15 minutes.
                    </p>
                    <button
                      type="button"
                      className="auth-back-btn"
                      onClick={() => switchMode('login')}
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Google Button for login/register only */}
                    {(mode === 'login' || mode === 'register') && (
                      <>
                        <div className={`auth-google-btn-wrap${isLoading ? ' auth-google-btn-wrap--disabled' : ''}`}>
                          {gLoading ? (
                            <div className="auth-google-btn">
                              <span className="auth-btn-spinner" />
                              <span>Signing in…</span>
                            </div>
                          ) : (
                            <GoogleLogin
                              onSuccess={handleGoogleCredential}
                              onError={() => setError('Google sign-in was cancelled or failed.')}
                              theme="filled_black"
                              shape="pill"
                              size="large"
                              text="continue_with"
                              width="100%"
                            />
                          )}
                        </div>

                        <div className="auth-divider">
                          <span>or {mode === 'login' ? 'sign in' : 'register'} with email</span>
                        </div>
                      </>
                    )}

                    {/* Main Form */}
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                      {mode === 'register' && (
                        <div className="auth-field">
                          <label className="auth-label">Full Name</label>
                          <input
                            type="text"
                            className="auth-input"
                            placeholder="Your full name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoComplete="name"
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
                        <div className="auth-field">
                          <label className="auth-label">Email Address</label>
                          <input
                            type="email"
                            className="auth-input"
                            placeholder="you@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={isLoading}
                          />
                        </div>
                      )}

                      {(mode === 'login' || mode === 'register') && (
                        <div className="auth-field">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="auth-label" style={{ margin: 0 }}>Password</label>
                            {mode === 'login' && (
                              <button
                                type="button"
                                className="auth-forgot-link"
                                onClick={() => switchMode('forgot_password')}
                              >
                                Forgot Password?
                              </button>
                            )}
                          </div>
                          <div className="auth-input-wrap" style={{ marginTop: '0.4rem' }}>
                            <input
                              type={showPwd ? 'text' : 'password'}
                              className="auth-input"
                              placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              required
                              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              className="auth-pwd-toggle"
                              onClick={() => setShowPwd(v => !v)}
                              tabIndex={-1}
                            >
                              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Reset Password Inputs */}
                      {mode === 'reset_password' && (
                        <>
                          <div className="auth-field">
                            <label className="auth-label">New Password</label>
                            <div className="auth-input-wrap">
                              <input
                                type={showPwd ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                className="auth-pwd-toggle"
                                onClick={() => setShowPwd(v => !v)}
                                tabIndex={-1}
                              >
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          <div className="auth-field">
                            <label className="auth-label">Confirm New Password</label>
                            <div className="auth-input-wrap">
                              <input
                                type={showConfirmPwd ? 'text' : 'password'}
                                className="auth-input"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                disabled={isLoading}
                              />
                              <button
                                type="button"
                                className="auth-pwd-toggle"
                                onClick={() => setShowConfirmPwd(v => !v)}
                                tabIndex={-1}
                              >
                                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={isLoading}
                        style={{ marginTop: '0.8rem' }}
                      >
                        {loading ? (
                          <span className="auth-btn-spinner" />
                        ) : mode === 'login' ? (
                          'Sign In'
                        ) : mode === 'register' ? (
                          'Create Account'
                        ) : mode === 'forgot_password' ? (
                          'Send Reset Link'
                        ) : (
                          'Update Password & Sign In'
                        )}
                      </button>

                      {/* Back link when in forgot password or reset password */}
                      {(mode === 'forgot_password' || mode === 'reset_password') && (
                        <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                          <button
                            type="button"
                            className="auth-back-btn"
                            onClick={() => switchMode('login')}
                          >
                            <ArrowLeft size={14} /> Return to Sign In
                          </button>
                        </div>
                      )}
                    </form>

                    {/* Switch mode link for login/register */}
                    {(mode === 'login' || mode === 'register') && (
                      <p className="auth-switch" style={{ marginTop: '1.2rem' }}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        >
                          {mode === 'login' ? 'Create one' : 'Sign in'}
                        </button>
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {/* Trust line */}
            <div className="auth-trust-row">
              <span className="auth-trust-item">🔒 256-bit encrypted</span>
              <span className="auth-trust-sep">·</span>
              <span className="auth-trust-item">Data never shared</span>
              <span className="auth-trust-sep">·</span>
              <span className="auth-trust-item">House of Varsh secure</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AuthModal;

