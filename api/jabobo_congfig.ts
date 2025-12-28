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
  }

export const JaboboConfig = {
    // 获取当前用户绑定的所有设备 ID
    getJaboboIds: async (): Promise<ApiResponse> => {
      const response = await apiClient.get('/user/jabobo_ids');
      return response.data;
    },
  
    // 👈 逻辑补全：绑定新设备 (Create)
    bindJabobo: async (jaboboId: string): Promise<ApiResponse> => {
      const response = await apiClient.post('/user/bind', { jabobo_id: jaboboId });
      return response.data;
    },
  
    // 👈 逻辑补全：解绑设备 (Delete)
    // 使用 delete 方法，并通过 params 传递 jabobo_id 匹配后端 Query 参数
    unbindJabobo: async (jaboboId: string): Promise<ApiResponse> => {
      const response = await apiClient.delete('/user/unbind', {
        params: { jabobo_id: jaboboId }
      });
      return response.data;
    },
  
    rebindJabobo: async (oldId: string, newId: string): Promise<ApiResponse> => {
      const response = await apiClient.put('/user/rebind', {
        old_jabobo_id: oldId,
        new_jabobo_id: newId
      });
      return response.data;
    },
  
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