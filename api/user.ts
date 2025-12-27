import apiClient from './apiClient';

// --- 类型定义 ---
export interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
  token?: string;
}

/**
 * 业务配置数据模型：包含 4 个核心字段
 */
export interface UserConfig {
  persona: string;       // 人设文本
  memory: string;        // 记忆文本
  voice_status: string;  // 声纹状态描述
  kb_status: string;     // 知识库状态描述
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
 * 1. 认证接口 (Login)
 */
export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  }
};

/**
 * 2. 用户管理接口 (Admin & Settings)
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
 * 3. 核心新增：业务配置接口 (查询与全量同步)
 */
export const configApi = {
  /** * 获取当前登录用户的全量配置
   */
  getUserConfig: async (): Promise<ApiResponse<UserConfig>> => {
    const response = await apiClient.get('/user/config');
    return response.data;
  },

  /** * 一键同步：同时更新人设、记忆、声纹状态和知识库状态
   * 传入的 data 必须符合 UserConfig 接口定义
   */
  syncConfig: async (data: UserConfig): Promise<ApiResponse> => {
    // 发送 POST 请求到后端的 sync-config 路由
    const response = await apiClient.post('/user/sync-config', data);
    return response.data;
  }
};