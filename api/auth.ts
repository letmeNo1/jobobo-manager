import axios from 'axios';

// --- 核心修复：定义后端返回的完整数据结构 ---
export interface LoginResponse {
  success: boolean;
  username: string;
  role: string;
  token: string; // 后端 UUID 生成的 session_token，必须定义
  message?: string;
}

const apiClient = axios.create({
  // 后端主入口定义的 API 前缀通常为 /api
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', 
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

export const authApi = {
  /**
   * 用户登录
   * 验证成功后会返回包含 token 的对象
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/login', { username, password });
      
      // 后端直接返回 {"success": true, "token": "...", ...}
      return response.data; 
    } catch (error: any) {
      // 提取 FastAPI raise HTTPException 时返回的 detail 错误信息
      const message = error.response?.data?.detail || '无法连接到服务器';
      throw new Error(message);
    }
  }
};