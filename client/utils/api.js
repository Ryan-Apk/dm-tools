const API_BASE_URL = 'http://localhost:3000';

// Shared in-flight refresh promise so concurrent 401s only trigger one /auth/refresh call
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Fetch wrapper that always sends cookies and, on a 401, silently refreshes
// the access token and retries the request once before giving up.
export async function apiFetch(path, options = {}) {
  const { skipAuthRetry, ...fetchOptions } = options;

  const init = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  };

  const url = `${API_BASE_URL}${path}`;
  let res = await fetch(url, init);

  if (res.status === 401 && !skipAuthRetry) {
    const refreshRes = await refreshAccessToken();
    if (refreshRes.ok) {
      res = await fetch(url, init);
    }
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(body?.error || 'Request failed');
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}
