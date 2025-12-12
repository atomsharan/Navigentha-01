import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to automatically add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // #region agent log
    const token = localStorage.getItem('authToken');
    fetch('http://127.0.0.1:7242/ingest/fa5d49d2-7751-4c5d-8580-f135a455c0d0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:10',message:'Request interceptor - token check',data:{url:config.url,method:config.method,tokenExists:!!token,tokenLength:token?.length||0,hasAuthHeader:!!config.headers.Authorization},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fa5d49d2-7751-4c5d-8580-f135a455c0d0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:13',message:'Authorization header set',data:{url:config.url,method:config.method,authHeaderPrefix:config.headers.Authorization?.substring(0,20)||'none',tokenPrefix:token.substring(0,20)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fa5d49d2-7751-4c5d-8580-f135a455c0d0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:16',message:'No token found in localStorage',data:{url:config.url,method:config.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor to handle global 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for roadmap endpoints - they have localStorage fallback
      const url = error.config?.url || '';
      if (!url.includes('/roadmap/')) {
        // For other endpoints, redirect to login page
        localStorage.removeItem('authToken');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;