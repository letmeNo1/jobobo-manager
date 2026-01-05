import { ApiResponse, VoiceprintRegisterParams, VoiceprintRegisterResponse } from "@/types";
import apiClient from "./apiClient";


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
   * 声纹注册接口（逻辑暂空）
   * @param params 声纹注册参数（包含设备ID、声纹名称、音频文件、认证信息）
   * @returns 声纹注册响应结果
   */
  registerVoiceprint: async (
    params: VoiceprintRegisterParams
  ): Promise<ApiResponse<VoiceprintRegisterResponse>> => {
    try {
      // 构建FormData（包含文件+普通参数）
      const formData = new FormData();
      formData.append("jabobo_id", params.jaboboId); // 设备ID
      formData.append("voiceprint_name", params.voiceprintName); // 声纹名称
      formData.append("file", params.file); // 音频文件

      // 发送声纹注册请求（后端逻辑暂空，仅返回成功响应）
      const response = await apiClient.post('/user/register-voiceprint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Username': params.xUsername, // 用户认证头
          'Authorization': params.authorization // Token认证头
        },
        // 上传进度监控
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`声纹注册文件上传进度：${percentCompleted}%`);
        }
      });

      return response.data;
    } catch (error) {
      // 统一异常处理
      console.error("声纹注册接口调用失败：", error);
      return {
        success: false,
        message: "声纹注册请求失败，请检查网络或接口地址",
        detail: error instanceof Error ? error.message : String(error)
      };
    }
  },

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
  }
};

export const jaboboVoice = JaboboVoice;