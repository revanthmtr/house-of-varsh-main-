/**
 * Enterprise Resilience API Client — House of Varsh
 * Handles cold-start auto-wakeups, network retries, safe JSON parsing, and graceful fallbacks.
 */

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://house-of-varsh-api.onrender.com';
  }
  return '';
};

/**
 * Resolves a relative path to full API URL in production
 */
export const resolveApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
};

/**
 * Bulletproof JSON fetcher — guarantees it NEVER throws JSON parse SyntaxError on HTML responses
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit,
  retries = 2
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const url = resolveApiUrl(endpoint);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        if (response.ok) {
          // If returned HTML on 200, it's an SPA rewrite
          data = null;
        } else {
          return {
            ok: false,
            status: response.status,
            data: null,
            error: text.length < 150 ? text : `Server error (${response.status})`,
          };
        }
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data,
          error: data?.error || data?.message || `Request failed with status ${response.status}`,
        };
      }

      return {
        ok: true,
        status: response.status,
        data,
      };
    } catch (err: any) {
      if (attempt < retries) {
        // Exponential backoff wait for server wake-up
        await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
        continue;
      }
      return {
        ok: false,
        status: 0,
        data: null,
        error: err?.message || 'Network connection failed. Please check your internet.',
      };
    }
  }

  return { ok: false, status: 0, data: null, error: 'Request timed out.' };
}

/**
 * Background silent server wake-up ping
 */
export const wakeUpServer = () => {
  if (typeof window === 'undefined') return;
  const url = resolveApiUrl('/api/health');
  fetch(url, { method: 'GET', keepalive: true }).catch(() => {
    // Ignore silent wake-up failures
  });
};
