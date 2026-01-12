import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, ChevronDown, Mic2, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

// 新增：已注册声纹数据类型
interface RegisteredVoiceprint {
  id: string;
  voiceprint_name: string;
  create_time: string;
  status: string;
  jabobo_id: string;
  // 可根据实际接口返回扩展字段
}

// 补充：声纹注册参数类型定义（和api中的VoiceprintRegisterParams保持一致）
interface VoiceprintRegisterParams {
  jaboboId: string;
  voiceprintName: string;
  filePath: string;
  xUsername: string;
  authorization: string;
}

// 组件Props
interface VoiceprintProps {
  onNavigate: (screen: Screen) => void;
  jaboboId: string;
}

// 辅助函数：格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 辅助函数：格式化时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '未知时间';
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

const Voiceprint: React.FC<VoiceprintProps> = ({ onNavigate, jaboboId }) => {
  const { t } = useTranslation();
  
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [MOCK_CHATS, setMOCK_CHATS] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audioList, setAudioList] = useState<AudioFile[]>([]);
  const [selectedAudioContent, setSelectedAudioContent] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [voiceprintName, setVoiceprintName] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // 新增：已注册声纹列表相关状态
  const [registeredVoiceprints, setRegisteredVoiceprints] = useState<RegisteredVoiceprint[]>([]);
  const [isLoadingVoiceprints, setIsLoadingVoiceprints] = useState(false);
  const [deleteVoiceprintLoading, setDeleteVoiceprintLoading] = useState<string>(''); // 记录正在删除的声纹ID

  // 获取音频文件列表（原有逻辑）
  useEffect(() => {
    const fetchVoiceprintList = async () => {
      if (!jaboboId) {
        console.log(`[${t('voiceprint.log.emptyJaboboId')}] jaboboId为空，终止请求`);
        setIsLoading(false);
        return;
      }

      const xUsername = localStorage.getItem("username") || "";
      const authorization = localStorage.getItem("auth_token") || "";

      console.log(`[${t('voiceprint.log.requestInfo')}] 参数信息：`, { jaboboId, xUsername, authorization });

      setIsLoading(true);
      try {
        const response = await jaboboVoice.listAudio(jaboboId, xUsername, authorization);
        console.log(`[${t('voiceprint.log.response')}] 接口返回：`, response);

        if (response.success && response.audio_list && Array.isArray(response.audio_list)) {
          setAudioList(response.audio_list);
          const realData: ChatHistory[] = response.audio_list.map((item: AudioFile) => ({
            id: item.file_path,
            title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
            duration: '0:00',
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
  }, [jaboboId, t]);

  // 新增：获取已注册的声纹列表
  useEffect(() => {
    const fetchRegisteredVoiceprints = async () => {
      if (!jaboboId) {
        console.log(`[${t('voiceprint.log.emptyJaboboId')}] jaboboId为空，终止获取已注册声纹请求`);
        return;
      }

      const xUsername = localStorage.getItem("username") || "";
      const authorization = localStorage.getItem("auth_token") || "";

      setIsLoadingVoiceprints(true);
      try {
        // 调用获取已注册声纹列表的接口（请根据实际接口调整）
        const response = await jaboboVoice.listRegisteredVoiceprints(jaboboId, xUsername, authorization);
        console.log(`[${t('voiceprint.log.registeredVoiceprintsResponse')}] 已注册声纹列表返回：`, response);

        if (response.success && Array.isArray(response.data)) {
          setRegisteredVoiceprints(response.data);
        } else {
          setRegisteredVoiceprints([]);
          console.warn(`[${t('voiceprint.log.noRegisteredVoiceprints')}]`, response.message || '无已注册声纹');
        }
      } catch (error) {
        console.error(`[${t('voiceprint.log.fetchRegisteredFailed')}] 获取已注册声纹列表失败：`, error);
        setRegisteredVoiceprints([]);
        alert(`${t('voiceprint.error.loadRegisteredVoiceprintsFailed')}: ${(error as Error).message || t('voiceprint.error.networkError')}`);
      } finally {
        setIsLoadingVoiceprints(false);
      }
    };

    fetchRegisteredVoiceprints();
  }, [jaboboId, t]);

  // 声纹注册核心逻辑（修复类型错误）
  const handleRegisterVoiceprint = async () => {
    if (!jaboboId || typeof jaboboId !== 'string') {
      alert(t('voiceprint.error.emptyJaboboId') || '捷宝宝设备ID不能为空');
      return;
    }
    
    const voiceprintNameStr = voiceprintName.trim();
    if (!voiceprintNameStr) {
      alert(t('voiceprint.error.emptyVoiceprintName') || '请输入声纹名称');
      return;
    }
    
    if (!selectedChat || typeof selectedChat !== 'string') {
      alert(t('voiceprint.error.noAudioSelected') || '请先选择音频文件');
      return;
    }

    // 关键修复：获取缺失的xUsername和authorization参数
    const xUsername = localStorage.getItem("username") || "";
    const authorization = localStorage.getItem("auth_token") || "";

    try {
      setIsRegistering(true);
      console.log(`[${t('voiceprint.log.registerStart') || '声纹注册'}] 开始注册声纹：`, {
        jaboboId,
        voiceprintName: voiceprintNameStr,
        filePath: selectedChat,
        xUsername,
        authorization
      });

      // 修复：补充完整的参数，匹配VoiceprintRegisterParams类型
      const response = await jaboboVoice.registerVoiceprint({
        jaboboId,
        voiceprintName: voiceprintNameStr,
        filePath: selectedChat,
        xUsername, // 新增
        authorization // 新增
      });

      console.log(`[${t('voiceprint.log.registerResponse') || '声纹注册响应'}] 注册结果：`, response);

      if (response && response.success) {
        alert(`${t('voiceprint.success.registerVoiceprint') || '声纹注册成功'}：${voiceprintNameStr}`);
        // 重置状态
        setVoiceprintName('');
        setSelectedChat('');
        setSelectedAudioContent('');
        setIsLoaded(false);
        
        // 新增：注册成功后刷新已注册声纹列表
        const reloadResponse = await jaboboVoice.listRegisteredVoiceprints(jaboboId, xUsername, authorization);
        if (reloadResponse.success && Array.isArray(reloadResponse.data)) {
          setRegisteredVoiceprints(reloadResponse.data);
        }
        
        onNavigate('DASHBOARD');
      } else {
        alert(`${t('voiceprint.error.registerFailed') || '声纹注册失败'}：${response?.message || response?.detail || '未知错误'}`);
      }
    } catch (error) {
      console.error(`[${t('voiceprint.log.registerError') || '声纹注册错误'}] 注册失败：`, error);
      alert(`${t('voiceprint.error.registerVoiceprintFailed') || '声纹注册请求失败'}: ${(error as Error).message || '网络错误'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // 新增：删除已注册的声纹
  const handleDeleteRegisteredVoiceprint = async (voiceprintId: string) => {
    if (!window.confirm(t('voiceprint.confirm.deleteVoiceprint') || '确定要删除该声纹吗？删除后将无法恢复！')) {
      return;
    }

    if (!jaboboId || !voiceprintId) {
      alert(t('voiceprint.error.deleteVoiceprintMissingParams') || '删除失败：缺少必要参数');
      return;
    }

    const xUsername = localStorage.getItem("username") || "";
    const authorization = localStorage.getItem("auth_token") || "";

    try {
      setDeleteVoiceprintLoading(voiceprintId);
      console.log(`[${t('voiceprint.log.deletingVoiceprint') || '删除声纹'}] 开始删除声纹: ${voiceprintId}`);
      
      // 调用删除声纹接口（请根据实际接口调整）
      const response = await jaboboVoice.deleteRegisteredVoiceprint(
        jaboboId,
        voiceprintId,
        xUsername,
        authorization
      );
      
      console.log(`[${t('voiceprint.log.deleteVoiceprintResponse') || '删除声纹响应'}] 接口返回：`, response);
      
      if (response.success) {
        alert(t('voiceprint.success.deleteVoiceprint') || '声纹删除成功');
        // 刷新声纹列表
        const reloadResponse = await jaboboVoice.listRegisteredVoiceprints(jaboboId, xUsername, authorization);
        if (reloadResponse.success && Array.isArray(reloadResponse.data)) {
          setRegisteredVoiceprints(reloadResponse.data);
        }
      } else {
        alert(`${t('voiceprint.error.deleteVoiceprintFailed') || '删除失败'}：${response.message || response.detail || '未知错误'}`);
      }
    } catch (error) {
      console.error(`[${t('voiceprint.log.deleteVoiceprintError') || '删除声纹错误'}] 失败：`, error);
      alert(`${t('voiceprint.error.deleteVoiceprintRequestFailed') || '声纹删除失败'}: ${(error as Error).message || '网络错误'}`);
    } finally {
      setDeleteVoiceprintLoading('');
    }
  };

  const handleVoiceprintNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value || '';
    setVoiceprintName(inputValue);
  };

  const handleDeleteSelectedAudio = async () => {
    if (!window.confirm(t('voiceprint.confirm.deleteAudio') || '确定要删除该音频文件吗？')) {
      return;
    }

    if (!jaboboId || !selectedChat) {
      alert(t('voiceprint.error.deleteMissingParams') || '删除失败：缺少必要参数');
      return;
    }

    const xUsername = localStorage.getItem("username") || "";
    const authorization = localStorage.getItem("auth_token") || "";

    try {
      setIsDeleting(true);
      console.log(`[${t('voiceprint.log.deletingAudio') || '删除音频'}] 开始删除文件: ${selectedChat}`);
      
      const response = await jaboboVoice.deleteAudio(
        jaboboId,
        selectedChat,
        xUsername,
        authorization
      );
      
      console.log(`[${t('voiceprint.log.deleteResponse') || '删除响应'}] 接口返回：`, response);
      
      if (response.success) {
        alert(t('voiceprint.success.deleteAudio') || '音频文件删除成功');
        
        setSelectedChat('');
        setSelectedAudioContent('');
        setIsLoaded(false);
        
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
          console.warn(`[${t('voiceprint.log.refreshFailed') || '刷新失败'}] 接口返回失败：`, reloadResponse.message || reloadResponse.detail);
        }
      } else {
        alert(`${t('voiceprint.error.deleteFailed') || '删除失败'}：${response.message || response.detail || '未知错误'}`);
      }
    } catch (error) {
      console.error(`[${t('voiceprint.log.deleteError') || '删除错误'}] 失败：`, error);
      alert(`${t('voiceprint.error.deleteAudioFailed') || '音频删除失败'}: ${(error as Error).message || '网络错误'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChat(val);
    
    if (val) {
      const selectedAudio = audioList.find(item => item.file_path === val);
      setSelectedAudioContent(selectedAudio?.audio_content || t('voiceprint.noAudioContent') || '无音频内容');
      
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

  return (
    <Layout className="bg-white">
      <div className="p-6">
        <button 
          onClick={() => onNavigate('DASHBOARD')} 
          className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600"
          aria-label={t('voiceprint.backToDashboard') || '返回仪表盘'}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('voiceprint.title') || '声纹注册'}</h2>
          <p className="text-center text-sm text-gray-500 px-6">
            {t('voiceprint.description') || '选择音频文件并命名声纹，完成声纹注册'}
          </p>
        </div>

        {/* 音频文件选择区域（原有） */}
        <div className="mb-8">
          <label className="block text-gray-700 font-bold text-sm mb-2">{t('voiceprint.label.selectSource') || '选择音频源'}</label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 appearance-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedChat}
              onChange={handleChatSelect}
              disabled={isLoading || isRegistering}
            >
              <option value="">{t('voiceprint.placeholder.chooseChat') || '选择音频文件'}</option>
              {isLoading ? (
                <option value="" disabled>{t('voiceprint.loading.audioList') || '加载音频列表中...'}</option>
              ) : (
                MOCK_CHATS.map(chat => {
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

        <div className="mb-8">
          <div className="w-full bg-gray-100 rounded-[24px] h-auto min-h-[32px] p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-6 bg-yellow-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{t('voiceprint.processing.audio') || '处理音频中...'}</span>
              </div>
            ) : isLoaded ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex space-x-1 mb-3">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <div key={i} className={`w-1 bg-yellow-400 rounded-full h-${h === 1 ? '2' : h === 2 ? '4' : h === 3 ? '6' : h === 4 ? '8' : '10'}`}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-bold mb-3">{t('voiceprint.status.audioLoaded') || '音频加载完成'}</span>
                
                <div className="w-full bg-white rounded-xl p-3 border border-gray-200 mt-2">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-gray-700">{t('voiceprint.label.audioContent') || '音频内容'}</h4>
                    <button
                      onClick={handleDeleteSelectedAudio}
                      disabled={isDeleting || isRegistering}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      aria-label={t('voiceprint.button.deleteAudio') || '删除音频'}
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {selectedAudioContent || t('voiceprint.noAudioContent') || '无音频内容'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <Mic2 size={32} className="mb-2" />
                <span className="text-xs">{t('voiceprint.prompt.selectFile') || '请选择音频文件'}</span>
              </div>
            )}
          </div>
        </div>

        {isLoaded && (
          <div className="animate-in fade-in duration-500 mb-12">
            <Input 
              label={t('voiceprint.label.nameVoiceprint') || '命名声纹'} 
              placeholder={t('voiceprint.placeholder.voiceprintExample') || '例如：爸爸、妈妈'} 
              value={voiceprintName}
              onChange={handleVoiceprintNameChange}
              disabled={isRegistering}
              type="text"
            />
            
            <button 
              onClick={handleRegisterVoiceprint}
              disabled={isRegistering || !voiceprintName.trim()}
              className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold mt-4 shadow-sm ${
                voiceprintName.trim() 
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isRegistering ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  <span>{t('voiceprint.button.registering') || '正在注册...'}</span>
                </>
              ) : (
                <>
                  <Mic2 size={20} className="mr-2" />
                  <span>{t('voiceprint.button.rememberVoiceprint') || '记住声纹'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 新增：已注册声纹列表区域 */}
        <div className="mt-10 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">{t('voiceprint.label.registeredVoiceprints') || '已注册的声纹'}</h3>
            {isLoadingVoiceprints && (
              <Loader2 size={16} className="text-gray-400 animate-spin" />
            )}
          </div>
          
          {isLoadingVoiceprints ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={24} className="mb-2 animate-spin" />
              <p className="text-sm">{t('voiceprint.loading.registeredVoiceprints') || '加载已注册声纹列表中...'}</p>
            </div>
          ) : registeredVoiceprints.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <XCircle size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">{t('voiceprint.prompt.noRegisteredVoiceprints') || '暂无已注册的声纹'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {registeredVoiceprints.map((voiceprint) => (
                <div 
                  key={voiceprint.id} 
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-800">{voiceprint.voiceprint_name}</span>
                        <CheckCircle2 size={14} className="text-green-500 ml-2" />
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{t('voiceprint.label.createTime') || '创建时间'}: {formatDateTime(voiceprint.create_time)}</span>
                        <span>{t('voiceprint.label.status') || '状态'}: {voiceprint.status === 'active' ? t('voiceprint.status.active') || '正常' : t('voiceprint.status.inactive') || '异常'}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteRegisteredVoiceprint(voiceprint.id)}
                      disabled={deleteVoiceprintLoading === voiceprint.id || isRegistering}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors ml-2"
                      aria-label={t('voiceprint.button.deleteVoiceprint') || '删除声纹'}
                    >
                      {deleteVoiceprintLoading === voiceprint.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Voiceprint;