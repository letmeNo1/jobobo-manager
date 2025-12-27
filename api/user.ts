import axios from 'axios';

// --- 类型定义 ---
export interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  detail?: string;
  message?: string;
}

// --- Axios 实例 ---
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// --- 请求拦截器：自动注入管理员鉴权 Header ---
apiClient.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    config.headers['x-username'] = user.username;
  }
  return config;
});

// --- 导出用户管理接口 ---
export const userManagementApi = {
  /** 获取用户列表 */
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  /** 创建新用户 */
  createUser: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /** 删除用户 */
  deleteUser: async (username: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${username}`);
    return response.data;
  },

  /** 管理员修改任意用户密码 */
  updatePassword: async (data: { username: string; new_password: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/password', data);
    return response.data;
  }
};