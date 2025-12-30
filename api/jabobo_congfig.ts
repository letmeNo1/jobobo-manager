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
    },

    /**
   * 🚀 新增：上传知识库文件
   * 专门处理二进制文件流，将路径存入 kb_status
   */
    uploadKnowledgeBase: async (jaboboId: string, file: File): Promise<ApiResponse> => {
      // 1. 创建 FormData 对象
      const formData = new FormData();
      formData.append('jabobo_id', jaboboId);
      formData.append('file', file);

      // 2. 发送 POST 请求
      // 注意：apiClient 通常会自动处理 FormData 的 Content-Type，不要手动设置 JSON Header
      const response = await apiClient.post('/user/upload-kb', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    listKnowledgeBase: async (jaboboId: string): Promise<ApiResponse> => {
      const response = await apiClient.get('/user/list-kb', {
        params: { jabobo_id: jaboboId }
      });
      return response.data;
    },

    /**
     * 🚀 新增：删除特定的知识库文件
     * @param jaboboId 设备ID
     * @param fileName 要删除的文件名
     */
    deleteKnowledgeBase: async (jaboboId: string, fileName: string): Promise<ApiResponse> => {
      const response = await apiClient.delete('/user/delete-kb', {
        params: { 
          jabobo_id: jaboboId,
          file_name: fileName 
        }
      });
      return response.data;
    }
    
  };
  
  // 别名导出，确保兼容性
  export const jaboboConfig = JaboboConfig;