import apiClient from "./apiClient";

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
    files?: any[];
  }

export const JaboboConfig = {
    // 获取特定设备的配置
    getUserConfig: async (jaboboId: string): Promise<ApiResponse<UserConfig>> => {
      const response = await apiClient.get('/user/config', { 
        params: { jabobo_id: jaboboId } 
      });
      return response.data;
    },
  
    // 同步特定设备的配置
    syncConfig: async (jaboboId: string, data: UserConfig): Promise<ApiResponse> => {
      const response = await apiClient.post('/user/sync-config', {
        jabobo_id: jaboboId,
        ...data
      });
      return response.data;
    }
    
  };
  
  // 别名导出，确保兼容性
  export const jaboboConfig = JaboboConfig;