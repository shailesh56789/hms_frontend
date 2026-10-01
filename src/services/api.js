

/**
 * API service - Google Apps Script backend ke saath kaam karta hai.
 *
 * Apps Script web app CORS preflight (custom headers / application/json) support nahi karta,
 * isliye:
 *  - har request POST hoti hai, Content-Type: text/plain
 *  - method, path, body aur JWT token JSON body ke andar jaate hain
 *
 * Interface axios jaisa hi hai (api.get / post / put / delete -> { data }),
 * isliye baaki pages mein koi change nahi chahiye.
 */

// ← Deploy ke baad mila hua /exec URL yahan paste karo (ya .env mein VITE_APPS_SCRIPT_URL set karo)
const SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbz2Tt1NTvBT09xxbeJiYdn7R5jq7Fkx5RYRa2Ji5uYGX5R1LRXeEizsKY4oJQtoYUDezQ/exec';

async function request(method, url, body) {
  const token = localStorage.getItem('token');

  let res;
  try {
    res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ method, path: url, body: body || {}, token }),
      redirect: 'follow',
    });
  } catch (e) {
    const err = new Error('Network error: Apps Script se connect nahi ho paya');
    err.response = { status: 0, data: { status: false, message: err.message } };
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch (e) {
    const err = new Error('Invalid response from Apps Script (deployment access "Anyone" hai?)');
    err.response = { status: 500, data: { status: false, message: err.message } };
    throw err;
  }

  const status = data.code || (data.status ? 200 : 400);

  if (!data.status) {
    // Token expire/invalid -> logout (login fail par redirect nahi)
    if (status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const err = new Error(data.message || 'Request failed');
    err.response = { status, data };
    throw err;
  }

  return { data, status };
}

const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  delete: (url) => request('DELETE', url),
};

export default api;