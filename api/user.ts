import axios from 'axios';

// --- 类型定义 ---
export interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
  token?: string; // 登录后返回的标识
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  detail?: string;
  message?: string;
  token?: string; // 登录接口特有
  username?: string;
  role?: string;
}

// --- Axios 实例 ---
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// --- 请求拦截器：核心修复点 ---
apiClient.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    
    // 1. 注入用户名（用于标识谁在操作）
    config.headers['x-username'] = user.username;
    
    // 2. 注入登录令牌（用于证明已登录且未伪造）
    // 注意：这里的 'Authorization' 必须与后端参数名一致
    if (user.token) {
      config.headers['Authorization'] = user.token;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- 响应拦截器：处理登录失效 ---
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 如果后端返回 401，说明 Token 失效，清除本地缓存并跳回登录
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- 导出用户管理接口 ---
export const userManagementApi = {
  /** 获取用户列表 (Admin 权限) */
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  /** 创建新用户 (Admin 权限) */
  createUser: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /** 删除用户 (Admin 权限) */
  deleteUser: async (username: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${username}`);
    return response.data;
  },

  /** * 修改密码 (受保护接口)
   * 如果是普通用户修改自己：传自己的 username
   * 如果是管理员修改别人：传目标的 username
   */
  updatePassword: async (data: { username: string; new_password: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/password', data);
    return response.data;
  }
};

// --- 导出认证接口 ---
export const authApi = {
  login: async (credentials: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  }
};