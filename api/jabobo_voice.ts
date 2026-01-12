import { ApiResponse, VoiceprintRegisterParams, VoiceprintRegisterResponse } from "@/types";
import apiClient from "./apiClient";

// 新增：定义已注册声纹的数据类型（和组件中对应）
export interface RegisteredVoiceprint {
  id: string;
  voiceprint_name: string;
  create_time: string;
  status: string;
  jabobo_id: string;
}

export const getRouteAuthParams = () => {
  // 从localStorage获取基础认证参数（路由传递的核心）
  return {
    jaboboId: localStorage.getItem('jabobo_id') || '',
    xUsername: localStorage.getItem('username') || '',
    authorization: localStorage.getItem('auth_token') || ''
  };
};

// 音频文件操作API
export const JaboboVoice = {
  /**
   * 上传音频文件
   * @param jaboboId 设备ID
   * @param file 音频文件对象
   * @param audioContent 音频文本内容（可选）
   * @returns API响应结果
   */
  uploadAudio: async (
    jaboboId: string,
    file: File,
    audioContent?: string
  ): Promise<ApiResponse> => {
    // 构建FormData（文件上传必须用FormData格式）
    const formData = new FormData();
    formData.append("jabobo_id", jaboboId);
    formData.append("file", file);
    // 可选的音频文本内容
    if (audioContent) {
      formData.append("audio_content", audioContent);
    }

    // 发送上传请求（注意设置Content-Type为multipart/form-data，axios会自动处理）
    const response = await apiClient.post('/user/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // 可选：上传进度监控
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`音频上传进度：${percentCompleted}%`);
      }
    });
    return response.data;
  },

  /**
   * 查询指定设备的音频文件列表
   * @param jaboboId 设备ID
   * @param xUsername 用户名（请求头）
   * @param authorization Token（请求头）
   * @returns 音频文件列表响应
   */
  listAudio: async (
    jaboboId: string,
    xUsername: string,
    authorization: string
  ): Promise<ApiResponse> => {
    const response = await apiClient.get('/user/list-audio', {
      params: { jabobo_id: jaboboId },
      headers: {
        'X-Username': xUsername,
        'Authorization': authorization
      }
    });
    return response.data;
  },

  /**
   * 删除指定的音频文件
   * @param jaboboId 设备ID
   * @param filePath 音频文件绝对路径
   * @param xUsername 用户名（请求头）
   * @param authorization Token（请求头）
   * @returns 删除操作响应
   */
  deleteAudio: async (
    jaboboId: string,
    filePath: string,
    xUsername: string,
    authorization: string
  ): Promise<ApiResponse> => {
    const response = await apiClient.delete('/user/delete-audio', {
      params: {
        jabobo_id: jaboboId,
        file_path: filePath
      },
      headers: {
        'X-Username': xUsername,
        'Authorization': authorization
      }
    });
    return response.data;
  },

  /**
   * 声纹注册接口
   * @param params 声纹注册参数（包含设备ID、声纹名称、音频文件、认证信息）
   * @returns 声纹注册响应结果
   */
  registerVoiceprint: async (
    params: VoiceprintRegisterParams
  ): Promise<ApiResponse<VoiceprintRegisterResponse>> => {
    try {
      // 参数校验
      if (!params.jaboboId?.trim() || !params.voiceprintName?.trim() || !params.filePath?.trim()) {
        return {
          success: false,
          message: '缺少必要参数：设备ID、声纹名称、文件路径不能为空',
          detail: '',
          data: {} as VoiceprintRegisterResponse
        };
      }

      const formData = new FormData();
      formData.append("jabobo_id", params.jaboboId.trim());
      formData.append("voiceprint_name", params.voiceprintName.trim());
      formData.append("file_path", params.filePath.trim());

      const response = await apiClient.post('/voiceprint/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Username': localStorage.getItem('username') || '',
          'Authorization': localStorage.getItem('auth_token') || ''
        }
      });

      return {
        success: true,
        message: response.data?.message || '注册成功',
        detail: '',
        data: response.data?.data || {} as VoiceprintRegisterResponse
      };

    } catch (error) {
      console.error("【注册错误原始信息】:", error);
      // 提取 422 响应的真实数据
      const axiosError = error as any;
      // 后端返回的 422 错误详情
      const backendError = axiosError.response?.data || {};
      
      return {
        success: false,
        // 优先显示后端的错误信息
        message: backendError?.message || axiosError.message || '注册失败',
        // 显示后端的具体错误
        detail: JSON.stringify(backendError?.detail || axiosError.stack),
        data: {} as VoiceprintRegisterResponse
      };
    }
  },

  /**
   * 获取指定设备的已注册声纹列表（适配后端真实接口 /voiceprint/list）
   * @param jaboboId 设备ID
   * @param xUsername 用户名（请求头）
   * @param authorization Token（请求头）
   * @returns 已注册声纹列表响应
   */
  listRegisteredVoiceprints: async (
    jaboboId: string,
    xUsername: string,
    authorization: string
  ): Promise<ApiResponse<RegisteredVoiceprint[]>> => {
    try {
      // 关键修改：路径改为 /voiceprint/list（后端实际路径）
      const response = await apiClient.get('/voiceprint/list', {
        params: { jabobo_id: jaboboId }, // 和后端Query参数名对齐
        headers: {
          'X-Username': xUsername,
          'Authorization': authorization
        }
      });
      return {
        success: true,
        message: response.data?.message || '获取已注册声纹列表成功',
        detail: '',
        data: response.data?.voiceprint_list || [] as RegisteredVoiceprint[] // 后端返回的字段是 voiceprint_list
      };
    } catch (error) {
      console.error("【获取已注册声纹列表错误】:", error);
      const axiosError = error as any;
      const backendError = axiosError.response?.data || {};
      
      return {
        success: false,
        message: axiosError.response?.status === 404 
          ? '声纹列表接口路径错误，请检查后端接口' 
          : backendError?.message || axiosError.message || '获取已注册声纹列表失败',
        detail: JSON.stringify(backendError?.detail || axiosError.stack),
        data: [] as RegisteredVoiceprint[]
      };
    }
  },

  /**

  /**
   * 新增：删除指定的已注册声纹
   * @param jaboboId 设备ID
   * @param voiceprintId 声纹ID
   * @param xUsername 用户名（请求头）
   * @param authorization Token（请求头）
   * @returns 删除操作响应
   */
  deleteRegisteredVoiceprint: async (
    jaboboId: string,
    voiceprintId: string,
    xUsername: string,
    authorization: string
  ): Promise<ApiResponse> => {
    try {
      const response = await apiClient.delete('/voiceprint/delete-registered', {
        params: {
          jabobo_id: jaboboId,
          voiceprint_id: voiceprintId
        },
        headers: {
          'X-Username': xUsername,
          'Authorization': authorization
        }
      });
      return {
        success: true,
        message: response.data?.message || '声纹删除成功',
        detail: '',
        data: response.data?.data || {}
      };
    } catch (error) {
      console.error("【删除已注册声纹错误】:", error);
      const axiosError = error as any;
      const backendError = axiosError.response?.data || {};
      
      return {
        success: false,
        message: backendError?.message || axiosError.message || '删除声纹失败',
        detail: JSON.stringify(backendError?.detail || axiosError.stack),
        data: {}
      };
    }
  },

  // 便捷方法：使用路由参数获取音频列表
  listAudioWithRouteParams: async (): Promise<ApiResponse> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.listAudio(jaboboId, xUsername, authorization);
  },

  // 便捷方法：使用路由参数删除音频
  deleteAudioWithRouteParams: async (filePath: string): Promise<ApiResponse> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.deleteAudio(jaboboId, filePath, xUsername, authorization);
  },

  // 便捷方法：使用路由参数上传音频
  uploadAudioWithRouteParams: async (file: File, audioContent?: string): Promise<ApiResponse> => {
    const { jaboboId } = getRouteAuthParams();
    return await JaboboVoice.uploadAudio(jaboboId, file, audioContent);
  },

  // 新增：便捷方法 - 使用路由参数获取已注册声纹列表
  listRegisteredVoiceprintsWithRouteParams: async (): Promise<ApiResponse<RegisteredVoiceprint[]>> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.listRegisteredVoiceprints(jaboboId, xUsername, authorization);
  },

  // 新增：便捷方法 - 使用路由参数删除已注册声纹
  deleteRegisteredVoiceprintWithRouteParams: async (voiceprintId: string): Promise<ApiResponse> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.deleteRegisteredVoiceprint(jaboboId, voiceprintId, xUsername, authorization);
  }
};

export const jaboboVoice = JaboboVoice;