import apiClient from './apiClient';

// --- 类型定义 ---
export interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
  token?: string;
}

export interface UserConfig {
  persona: string;
  memory: string;
  voice_status: string;
  kb_status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  detail?: string;
  message?: string;
  token?: string; 
  username?: string;
  role?: string;
  jabobo_ids?: string[];
}

/**
 * 1. 认证接口 (Login)
 */
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  }
};

/**
 * 2. 用户管理接口 (Admin 页面使用)
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
  // 👈 逻辑补全：删除用户
  deleteUser: async (username: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${username}`);
    return response.data;
  },
  updatePassword: async (data: { username: string; new_password: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/password', data);
    return response.data;
  }
};