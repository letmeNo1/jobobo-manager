import apiClient from "./apiClient";

// --- 类型定义保持不变 ---
export interface BackendFileInfo {
  file_path: string;
  file_name: string;
  file_size_bytes: number;
  file_size_mb: number;
  upload_time: string;
  upload_timestamp: number;
  status?: string;
}

export interface ListKnowledgeBaseResponse {
  success: boolean;
  total_count: number;
  kb_list: BackendFileInfo[];
  message: string;
}

export const JaboboKnownledgeBase = {
  // 1. 修正路径为 /user/list-kb
  listKnowledgeBase: async (jaboboId: string): Promise<ListKnowledgeBaseResponse> => {
    const response = await apiClient.get('/user/list-kb', {
      params: {
        jabobo_id: jaboboId,
        t: new Date().getTime()
      },
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  },

  // 2. 修正路径为 /user/upload-kb
  uploadKnowledgeBase: async (jaboboId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jabobo_id', jaboboId);
    
    const response = await apiClient.post('/user/upload-kb', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 3. 修正路径为 /user/delete-kb
  deleteKnowledgeBase: async (jaboboId: string, filePath: string): Promise<any> => {
    const response = await apiClient.delete('/user/delete-kb', {
      params: {
        jabobo_id: jaboboId,
        file_path: filePath 
      }
    });
    return response.data;
  }
};

export const jaboboKnowledgeBase = JaboboKnownledgeBase;