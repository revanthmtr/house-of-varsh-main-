import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

// ── Global API URL Routing for Production Hosting (GoDaddy / Render) ────────
const API_URL = (
  (import.meta.env.VITE_API_URL || '').trim() ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://house-of-varsh-api.onrender.com'
    : '')
).trim();

if (API_URL && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string') {
      if (input.startsWith('/api') || input.startsWith('/uploads')) {
        input = `${API_URL.replace(/\/$/, '')}${input}`;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api') || input.pathname.startsWith('/uploads')) {
        input = new URL(`${API_URL.replace(/\/$/, '')}${input.pathname}${input.search}`);
      }
    }
    return originalFetch.call(this, input, init);
  };
}


const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '118817308805-sehbo62sknilfkeht45m04252rfrevq9.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
