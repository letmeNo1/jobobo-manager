import axios from 'axios';

/**
 * 提取后的基础 API 客户端
 * 所有的业务请求都应该基于这个实例发送
 */
const apiClient = axios.create({
  // 开发环境下建议直接写死后端地址，例如 'http://123.123.123.123:5000/api'
  // 以防 import.meta.env 没生效导致请求发往了前端自己的 5173 端口
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// --- 请求拦截器 ---
apiClient.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    
    // 后端 auth.py 的 get_current_user 依赖这两个 Header
    config.headers['x-username'] = user.username;
    
    if (user.token) {
      config.headers['Authorization'] = user.token;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- 响应拦截器 ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一处理鉴权失败
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;