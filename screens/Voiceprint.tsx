import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, ChevronDown, Mic2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 引入i18n钩子
import Layout from '../components/Layout';
import { Screen, ChatHistory } from '../types';
import Input from '../components/Input';
import { jaboboVoice } from '../api/jabobo_voice';

// 适配真实返回的音频数据类型
interface AudioFile {
  audio_content: string;
  audio_format: string;
  current_modify_time: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  file_size_mb: number;
  status: string;
  upload_time: string;
  upload_timestamp: number;
}

// 组件Props（和知识库对齐）
interface VoiceprintProps {
  onNavigate: (screen: Screen) => void;
  jaboboId: string;
}

// 辅助函数：格式化文件大小（复用知识库的逻辑）
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Voiceprint: React.FC<VoiceprintProps> = ({ onNavigate, jaboboId }) => {
  // 获取i18n翻译函数
  const { t } = useTranslation();
  
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [MOCK_CHATS, setMOCK_CHATS] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 新增状态存储原始音频列表
  const [audioList, setAudioList] = useState<AudioFile[]>([]);
  // 新增状态存储选中音频的content
  const [selectedAudioContent, setSelectedAudioContent] = useState<string>('');
  // 新增删除加载状态
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchVoiceprintList = async () => {
      if (!jaboboId) {
        console.log(`[${t('voiceprint.log.emptyJaboboId')}] jaboboId为空，终止请求`);
        setIsLoading(false);
        return;
      }

      // 自动获取认证信息
      const xUsername = localStorage.getItem("username") || "";
      const authorization = localStorage.getItem("auth_token") || "";

      console.log(`[${t('voiceprint.log.requestInfo')}] 参数信息：`, { jaboboId, xUsername, authorization });

      setIsLoading(true);
      try {
        const response = await jaboboVoice.listAudio(jaboboId, xUsername, authorization);
        console.log(`[${t('voiceprint.log.response')}] 接口返回：`, response);

        // 适配真实返回的audio_list数据格式
        if (response.success && response.audio_list && Array.isArray(response.audio_list)) {
          // 存储原始音频列表到状态
          setAudioList(response.audio_list);
          // 映射为ChatHistory格式
          const realData: ChatHistory[] = response.audio_list.map((item: AudioFile) => ({
            id: item.file_path, // 用file_path作为唯一ID
            // title格式：日期 + 文件名（和知识库一致）
            title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
            // 时长字段接口没有，保留原占位
            duration: '0:00',
            // 日期取upload_time的日期部分
            date: item.upload_time.split(' ')[0] || t('voiceprint.unknownTime')
          }));
          setMOCK_CHATS(realData);
        } else {
          setMOCK_CHATS([]);
          setAudioList([]);
          console.warn(`[${t('voiceprint.log.noAudioData')}]`, response.message || response.detail || t('voiceprint.emptyData'));
        }
      } catch (error) {
        console.error(`[${t('voiceprint.log.fetchFailed')}] 获取列表失败：`, error);
        setMOCK_CHATS([]);
        setAudioList([]);
        alert(`${t('voiceprint.error.loadListFailed')}: ${(error as Error).message || t('voiceprint.error.networkError')}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoiceprintList();
  }, [jaboboId, t]); // 添加t到依赖，确保语言切换时重新渲染

  // 新增：删除当前选中音频的函数（适配 ApiResponse 类型）
  const handleDeleteSelectedAudio = async () => {
    // 二次确认
    if (!window.confirm(t('voiceprint.confirm.deleteAudio'))) {
      return;
    }

    // 校验必要参数
    if (!jaboboId || !selectedChat) {
      alert(t('voiceprint.error.deleteMissingParams'));
      return;
    }

    // 获取认证信息
    const xUsername = localStorage.getItem("username") || "";
    const authorization = localStorage.getItem("auth_token") || "";

    try {
      setIsDeleting(true);
      console.log(`[${t('voiceprint.log.deletingAudio')}] 开始删除文件: ${selectedChat}`);
      
      // 调用删除接口
      const response = await jaboboVoice.deleteAudio(
        jaboboId,
        selectedChat, // selectedChat 是选中音频的 file_path
        xUsername,
        authorization
      );
      
      console.log(`[${t('voiceprint.log.deleteResponse')}] 接口返回：`, response);
      
      // 仅使用类型中存在的 success 字段判断
      if (response.success) {
        alert(t('voiceprint.success.deleteAudio'));
        
        // 清空选中状态
        setSelectedChat('');
        setSelectedAudioContent('');
        setIsLoaded(false);
        
        // 重新加载音频列表（刷新数据）
        const xUsernameReload = localStorage.getItem("username") || "";
        const authorizationReload = localStorage.getItem("auth_token") || "";
        const reloadResponse = await jaboboVoice.listAudio(jaboboId, xUsernameReload, authorizationReload);
        
        if (reloadResponse.success) {
          if (reloadResponse.audio_list && Array.isArray(reloadResponse.audio_list)) {
            setAudioList(reloadResponse.audio_list);
            const newChats = reloadResponse.audio_list.map((item: AudioFile) => ({
              id: item.file_path,
              title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
              duration: '0:00',
              date: item.upload_time.split(' ')[0] || t('voiceprint.unknownTime')
            }));
            setMOCK_CHATS(newChats);
          } else {
            setMOCK_CHATS([]);
            setAudioList([]);
          }
        } else {
          setMOCK_CHATS([]);
          setAudioList([]);
          console.warn(`[${t('voiceprint.log.refreshFailed')}] 接口返回失败：`, reloadResponse.message || reloadResponse.detail);
        }
      } else {
        // 优先用 message，其次用 detail 展示错误信息
        alert(`${t('voiceprint.error.deleteFailed')}：${response.message || response.detail || t('voiceprint.error.unknownError')}`);
      }
    } catch (error) {
      console.error(`[${t('voiceprint.log.deleteError')}] 失败：`, error);
      alert(`${t('voiceprint.error.deleteAudioFailed')}: ${(error as Error).message || t('voiceprint.error.networkError')}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChat(val);
    
    // 查找选中音频的content
    if (val) {
      const selectedAudio = audioList.find(item => item.file_path === val);
      setSelectedAudioContent(selectedAudio?.audio_content || t('voiceprint.noAudioContent'));
      
      setIsProcessing(true);
      setIsLoaded(false);
      setTimeout(() => {
        setIsProcessing(false);
        setIsLoaded(true);
      }, 2000);
    } else {
      setSelectedAudioContent('');
      setIsLoaded(false);
    }
  };

  // 完整渲染逻辑
  return (
    <Layout className="bg-white">
      <div className="p-6">
        <button 
          onClick={() => onNavigate('DASHBOARD')} 
          className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600"
          aria-label={t('voiceprint.backToDashboard')}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} />
          </div>
          <p className="text-center text-sm text-gray-500 px-6">
            {t('voiceprint.description')}
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-bold text-sm mb-2">{t('voiceprint.label.selectSource')}</label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 appearance-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedChat}
              onChange={handleChatSelect}
              disabled={isLoading}
            >
              <option value="">{t('voiceprint.placeholder.chooseChat')}</option>
              {isLoading ? (
                <option value="" disabled>{t('voiceprint.loading.audioList')}</option>
              ) : (
                MOCK_CHATS.map(chat => {
                  // 从audioList状态中查找对应的音频项
                  const audioItem = audioList.find(item => item.file_path === chat.id);
                  return (
                    <option key={chat.id} value={chat.id}>
                      {chat.title} ({audioItem ? `${audioItem.file_size_mb.toFixed(2)} MB` : '0.00 MB'})
                    </option>
                  );
                })
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Audio Visualizer Placeholder - 新增audio content展示 */}
        <div className="mb-8">
          <div className="w-full bg-gray-100 rounded-[24px] h-auto min-h-[32px] p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-6 bg-yellow-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{t('voiceprint.processing.audio')}</span>
              </div>
            ) : isLoaded ? (
              <div className="flex flex-col items-center w-full">
                {/* 原有音频可视化 */}
                <div className="flex space-x-1 mb-3">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <div key={i} className={`w-1 bg-yellow-400 rounded-full h-${h === 1 ? '2' : h === 2 ? '4' : h === 3 ? '6' : h === 4 ? '8' : '10'}`}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-bold mb-3">{t('voiceprint.status.audioLoaded')}</span>
                
                {/* 新增Audio Content展示区域 */}
                <div className="w-full bg-white rounded-xl p-3 border border-gray-200 mt-2">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-gray-700">{t('voiceprint.label.audioContent')}</h4>
                    {/* 新增：选中后显示删除按钮 */}
                    <button
                      onClick={handleDeleteSelectedAudio}
                      disabled={isDeleting}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label={t('voiceprint.button.deleteAudio')}
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {selectedAudioContent || t('voiceprint.noAudioContent')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <Mic2 size={32} className="mb-2" />
                <span className="text-xs">{t('voiceprint.prompt.selectFile')}</span>
              </div>
            )}
          </div>
        </div>

        {isLoaded && (
          <div className="animate-in fade-in duration-500">
            <Input 
              label={t('voiceprint.label.nameVoiceprint')} 
              placeholder={t('voiceprint.placeholder.voiceprintExample')} 
            />
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="w-full yellow-button py-4 rounded-2xl flex items-center justify-center font-bold mt-4 shadow-sm"
            >
              <Mic2 size={20} className="mr-2" />
              <span>{t('voiceprint.button.rememberVoiceprint')}</span>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Voiceprint;