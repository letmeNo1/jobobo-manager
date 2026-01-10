import axios from 'axios';

/**
 * 提取后的基础 API 客户端
 * 所有的业务请求都应该基于这个实例发送
 */
const apiClient = axios.create({
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

// --- 响应拦截器（修复版）---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. 先判断是否是 401 错误
    if (error.response?.status === 401) {
      // 2. 判断当前请求是否是登录接口（根据实际接口路径调整）
      const isLoginRequest = error.config?.url?.includes('login');
      
      // 3. 只有非登录接口的 401 才执行登出跳转
      if (!isLoginRequest) {
        localStorage.removeItem('user');
        window.location.href = '/app';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;