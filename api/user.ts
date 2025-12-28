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
 * 2. 用户管理接口 (AdminUserManagement.tsx 调用)
 * 👈 修复你报错的关键点：确保这个对象被导出
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

/**
 * 3. 捷宝宝核心业务接口 (JaboboSelector 和 Dashboard 调用)
 */
export const jaboboApi = {
  getJaboboIds: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/user/jabobo_ids');
    return response.data;
  },
  bindJabobo: async (jaboboId: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/user/bind', { jabobo_id: jaboboId });
    return response.data;
  },
  getUserConfig: async (jaboboId: string): Promise<ApiResponse<UserConfig>> => {
    const response = await apiClient.get('/user/config', { 
      params: { jabobo_id: jaboboId } 
    });
    return response.data;
  },
  syncConfig: async (jaboboId: string, data: UserConfig): Promise<ApiResponse> => {
    const response = await apiClient.post('/user/sync-config', {
      jabobo_id: jaboboId,
      ...data
    });
    return response.data;
  }
};

// 别名导出，确保之前用 configApi 的代码不报错
export const configApi = jaboboApi;