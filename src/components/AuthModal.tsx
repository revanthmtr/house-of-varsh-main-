import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import './AuthModal.css';

type Mode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();

  const [mode, setMode]           = useState<Mode>('login');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [success, setSuccess]     = useState('');

  const reset = () => {
    setName(''); setEmail(''); setPassword('');
    setError(''); setSuccess(''); setLoading(false); setGLoading(false);
  };

  const switchMode = (m: Mode) => { reset(); setMode(m); };

  const handleSuccess = (token: string, user: any, greeting: string) => {
    setSuccess(greeting);
    setTimeout(() => { login(token, user); onClose(); reset(); }, 900);
  };

  // ── Email / Password submit ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
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
        throw new Error(data.error || data.message || `Authentication service error (${res.status})`);
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

  // ── Google OAuth (ID-token flow — same endpoint the One Tap prompt uses) ──
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
              <button className="auth-close" onClick={onClose}>
                <X size={18} />
              </button>
            )}

            {/* Brand */}
            <div className="auth-brand">
              <img src="/chinni_logo.png" alt="House of Varsh" className="auth-logo-img" style={{ height: '36px', marginBottom: '0.8rem' }} />
              <h2 className="auth-title">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to access your exclusive collection and wishlist.'
                  : 'Join House of Varsh for a curated luxury experience.'}
              </p>
            </div>

            {/* Mode tabs */}
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

            {/* Success */}
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

            {/* Error */}
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
                {/* Google Button — ID-token flow, verified server-side */}
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

                {/* Divider */}
                <div className="auth-divider">
                  <span>or {mode === 'login' ? 'sign in' : 'register'} with email</span>
                </div>

                {/* Email / Password Form */}
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

                  <div className="auth-field">
                    <label className="auth-label">Password</label>
                    <div className="auth-input-wrap">
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

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                  >
                    {loading ? (
                      <span className="auth-btn-spinner" />
                    ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                {/* Switch mode link */}
                <p className="auth-switch">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  >
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
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
