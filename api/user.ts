import apiClient from './apiClient';

// --- 类型定义 ---
export interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  detail?: string;
  message?: string;
  token?: string; 
  username?: string;
  role?: string;
}

/**
 * 认证接口 (Login)
 */
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    // 路径已对齐后端 main.py 的 prefix="/api" + auth.py 的 "/login"
    const response = await apiClient.post('/login', credentials);
    return response.data;
  }
};

/**
 * 用户管理接口 (Admin & Settings)
 */
export const userManagementApi = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  deleteUser: async (username: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${username}`);
    return response.data;
  },

  updatePassword: async (data: { username: string; new_password: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/password', data);
    return response.data;
  }
};