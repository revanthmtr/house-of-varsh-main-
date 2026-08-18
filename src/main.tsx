import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { getApiBaseUrl, wakeUpServer } from './utils/api.ts'

// ── Global API URL Routing for Production Hosting (GoDaddy / Render) ────────
const API_URL = getApiBaseUrl();

if (API_URL && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        input = `${API_URL}${input}`;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api') || input.pathname.startsWith('/uploads')) {
        input = new URL(`${API_URL}${input.pathname}${input.search}`);
      }
    }
    return originalFetch.call(this, input, init);
  };

  // Trigger silent cold-start wake-up on Render
  wakeUpServer();
}

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim() ||
  '118817308805-sehbo62sknilfkeht45m04252rfrevq9.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// ── Dismiss branded splash screen once React has painted ────────────────────
function dismissSplash() {
  const splash = document.getElementById('hov-splash');
  const root = document.getElementById('root');
  const bar = document.getElementById('hov-bar');

  // Complete the progress bar first
  if (bar) bar.style.width = '100%';

  // Stop the fake progress timer
  if ((window as any).__hovSplashTimer) {
    clearInterval((window as any).__hovSplashTimer);
  }

  setTimeout(() => {
    if (splash) {
      splash.style.transition = 'opacity 0.45s ease';
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.remove();
      }, 460);
    }
    if (root) {
      root.classList.add('ready');
    }
  }, 200);
}

// Use requestIdleCallback for best paint timing; fallback to rAF
if ('requestIdleCallback' in window) {
  requestIdleCallback(dismissSplash, { timeout: 2000 });
} else {
  requestAnimationFrame(() => requestAnimationFrame(dismissSplash));
}
