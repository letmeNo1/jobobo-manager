import { ApiResponse, User } from '@/types';
import apiClient from './apiClient';

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