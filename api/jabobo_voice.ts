import { ApiResponse, VoiceprintRegisterParams, VoiceprintRegisterResponse } from "@/types";
import apiClient from "./apiClient";

export const getRouteAuthParams = () => {
  return {
    jaboboId: localStorage.getItem('jabobo_id') || '',
    xUsername: localStorage.getItem('username') || '',
    authorization: localStorage.getItem('auth_token') || ''
  };
};

// 音频文件操作API
export const JaboboVoice = {
  // 【保留原有方法不变】
  uploadAudio: async (
    jaboboId: string,
    file: File,
    audioContent?: string
  ): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("jabobo_id", jaboboId);
    formData.append("file", file);
    if (audioContent) {
      formData.append("audio_content", audioContent);
    }

    const response = await apiClient.post('/user/upload-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`音频上传进度：${percentCompleted}%`);
      }
    });
    return response.data;
  },

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

  deleteAudio: async (
    jaboboId: string,
    filePath: string,
    xUsername: string,
    authorization: string
  ): Promise<ApiResponse> => {
    const response = await apiClient.delete('/user/delete-audio', {
      params: { jabobo_id: jaboboId, file_path: filePath },
      headers: {
        'X-Username': xUsername,
        'Authorization': authorization
      }
    });
    return response.data;
  },

  // 【修正声纹注册方法：移除xUsername/authorization相关】
  registerVoiceprint: async (
    params: VoiceprintRegisterParams // 现在类型只包含3个字段
  ): Promise<ApiResponse<VoiceprintRegisterResponse>> => {
    try {
      // 1. 校验核心参数
      if (!params.jaboboId) {
        throw new Error("捷宝宝设备ID不能为空");
      }
      if (!params.voiceprintName) {
        throw new Error("声纹名称不能为空");
      }
      if (!params.filePath) {
        throw new Error("音频文件路径不能为空");
      }

      // 2. 构建FormData（仅传递后端需要的3个参数）
      const formData = new FormData();
      formData.append("jabobo_id", params.jaboboId);
      formData.append("voiceprint_name", params.voiceprintName);
      formData.append("file_path", params.filePath);

      // 3. 发送请求（移除多余的认证请求头）
      const response = await apiClient.post('/voiceprint/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`声纹注册请求上传进度：${percentCompleted}%`);
        }
      });

      return response.data;
    } catch (error) {
      console.error("声纹注册接口调用失败：", error);
      const errorMsg = error instanceof Error 
        ? error.message 
        : "声纹注册请求失败，请检查网络或参数是否正确";
      
      return {
        success: false,
        message: errorMsg,
        detail: error instanceof Error ? error.stack : String(error),
        data: {} as VoiceprintRegisterResponse
      };
    }
  },

  // 【扩展方法：声纹列表查询】
  listVoiceprints: async (jaboboId: string): Promise<ApiResponse> => {
    try {
      if (!jaboboId) throw new Error("捷宝宝设备ID不能为空");
      const response = await apiClient.get('/voiceprint/list', {
        params: { jabobo_id: jaboboId }
      });
      return response.data;
    } catch (error) {
      console.error("查询声纹列表失败：", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "查询声纹列表失败",
        detail: String(error)
      };
    }
  },

  // 【扩展方法：声纹删除】
  deleteVoiceprint: async (
    jaboboId: string,
    voiceprintName: string
  ): Promise<ApiResponse> => {
    try {
      if (!jaboboId) throw new Error("捷宝宝设备ID不能为空");
      if (!voiceprintName) throw new Error("声纹名称不能为空");

      const formData = new FormData();
      formData.append("jabobo_id", jaboboId);
      formData.append("voiceprint_name", voiceprintName);

      const response = await apiClient.delete('/voiceprint/delete', {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("删除声纹失败：", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "删除声纹失败",
        detail: String(error)
      };
    }
  },

  // 【简化调用方法】
  listAudioWithRouteParams: async (): Promise<ApiResponse> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.listAudio(jaboboId, xUsername, authorization);
  },
  deleteAudioWithRouteParams: async (filePath: string): Promise<ApiResponse> => {
    const { jaboboId, xUsername, authorization } = getRouteAuthParams();
    return await JaboboVoice.deleteAudio(jaboboId, filePath, xUsername, authorization);
  },
  uploadAudioWithRouteParams: async (file: File, audioContent?: string): Promise<ApiResponse> => {
    const { jaboboId } = getRouteAuthParams();
    return await JaboboVoice.uploadAudio(jaboboId, file, audioContent);
  },
  // 【修正简化版声纹注册：类型匹配】
  registerVoiceprintWithRouteParams: async (
    voiceprintName: string,
    filePath: string
  ): Promise<ApiResponse<VoiceprintRegisterResponse>> => {
    const { jaboboId } = getRouteAuthParams();
    // 现在参数完全匹配VoiceprintRegisterParams类型
    return await JaboboVoice.registerVoiceprint({
      jaboboId,
      voiceprintName,
      filePath
    });
  }
};

export const jaboboVoice = JaboboVoice;