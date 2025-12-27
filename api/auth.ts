import axios from 'axios';

// 定义后端返回的数据结构
export interface LoginResponse {
  success: boolean;
  username: string;
  role: string;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/login', { username, password });
      return response.data;
    } catch (error: any) {
      // 提取 FastAPI 返回的 detail 错误信息
      const message = error.response?.data?.detail || '无法连接到服务器';
      throw new Error(message);
    }
  }
};