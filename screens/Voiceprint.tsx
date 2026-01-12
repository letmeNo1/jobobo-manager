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

// 🔥 修正：匹配后端实际返回的字段（speaker_id 替代 id）
interface RegisteredVoiceprint {
  speaker_id: string; // 后端真实声纹ID字段
  voiceprint_name: string;
  create_time: string;
  status: string;
  jabobo_id: string;
}

// 补充：声纹注册参数类型定义
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
  if (!dateStr) return '';
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
  const [registeredVoiceprints, setRegisteredVoiceprints] = useState<RegisteredVoiceprint[]>([]);
  const [isLoadingVoiceprints, setIsLoadingVoiceprints] = useState(false);
  const [deleteVoiceprintLoading, setDeleteVoiceprintLoading] = useState<string>('');

  // 获取音频文件列表
  useEffect(() => {
    const fetchVoiceprintList = async () => {
      if (typeof jaboboId !== 'string' || jaboboId.trim() === '') {
        console.log(`[日志] jaboboId为空，终止请求`);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await jaboboVoice.listAudio(jaboboId);
        console.log(`[日志] 音频列表返回：`, response);

        if (response.success && response.audio_list && Array.isArray(response.audio_list)) {
          setAudioList(response.audio_list);
          const realData: ChatHistory[] = response.audio_list.map((item: AudioFile) => ({
            id: item.file_path,
            title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
            duration: '0:00',
            date: item.upload_time.split(' ')[0] || ''
          }));
          setMOCK_CHATS(realData);
        } else {
          setMOCK_CHATS([]);
          setAudioList([]);
          console.warn(`[日志] 无音频数据`, response.message || response.detail);
        }
      } catch (error) {
        console.error(`[日志] 获取音频列表失败：`, error);
        setMOCK_CHATS([]);
        setAudioList([]);
        alert(`${t('voiceprint.error.loadListFailed')}: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoiceprintList();
  }, [jaboboId, t]);

  // 获取已注册的声纹列表
  useEffect(() => {
    const fetchRegisteredVoiceprints = async () => {
      if (typeof jaboboId !== 'string' || jaboboId.trim() === '') {
        console.log(`[日志] jaboboId为空，终止获取已注册声纹请求`);
        return;
      }

      setIsLoadingVoiceprints(true);
      try {
        const response = await jaboboVoice.listRegisteredVoiceprints(jaboboId);
        console.log("【后端原始声纹数据】:", response.data);

        console.log(`[日志] 已注册声纹列表返回：`, response);

        if (response.success && Array.isArray(response.data)) {
          setRegisteredVoiceprints(response.data);
        } else {
          setRegisteredVoiceprints([]);
          console.warn(`[日志] 无已注册声纹`, response.message);
        }
      } catch (error) {
        console.error(`[日志] 获取已注册声纹列表失败：`, error);
        setRegisteredVoiceprints([]);
        alert(`${t('voiceprint.error.loadRegisteredVoiceprintsFailed')}: ${(error as Error).message}`);
      } finally {
        setIsLoadingVoiceprints(false);
      }
    };

    fetchRegisteredVoiceprints();
  }, [jaboboId, t]);

  // 声纹注册核心逻辑（无修改）
  const handleRegisterVoiceprint = async () => {
    const validJaboboId = typeof jaboboId === 'string' && jaboboId.trim() !== '';
    const voiceprintNameStr = typeof voiceprintName === 'string' ? voiceprintName.trim() : '';
    const validSelectedChat = typeof selectedChat === 'string' && selectedChat.trim() !== '';
    
    if (!validJaboboId) {
      alert(t('voiceprint.error.emptyJaboboId'));
      return;
    }
    
    if (!voiceprintNameStr) {
      alert(t('voiceprint.error.emptyVoiceprintName'));
      return;
    }
    
    if (!validSelectedChat) {
      alert(t('voiceprint.error.noAudioSelected'));
      return;
    }

    try {
      setIsRegistering(true);
      console.log(`[日志] 开始注册声纹：`, {
        jaboboId,
        voiceprintName: voiceprintNameStr,
        filePath: selectedChat
      });

      const response = await jaboboVoice.registerVoiceprint({
        jaboboId,
        voiceprintName: voiceprintNameStr,
        filePath: selectedChat
      });

      console.log(`[日志] 注册结果：`, response);

      if (response && response.success) {
        alert(`${t('voiceprint.success.registerVoiceprint')}：${voiceprintNameStr}`);
        setVoiceprintName('');
        setSelectedChat('');
        setSelectedAudioContent('');
        setIsLoaded(false);
        
        const reloadResponse = await jaboboVoice.listRegisteredVoiceprints(jaboboId);
        if (reloadResponse.success && Array.isArray(reloadResponse.data)) {
          setRegisteredVoiceprints(reloadResponse.data);
        }
        
        onNavigate('DASHBOARD');
      } else {
        alert(`${t('voiceprint.error.registerFailed')}：${response?.message || response?.detail}`);
      }
    } catch (error) {
      console.error(`[日志] 注册失败：`, error);
      alert(`${t('voiceprint.error.registerVoiceprintFailed')}: ${(error as Error).message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // 🔥 核心修复1：删除函数接收2个参数（speakerId + voiceprintName）
  const handleDeleteRegisteredVoiceprint = async (speakerId: string, voiceprintName: string) => {
    if (!window.confirm(t('voiceprint.confirm.deleteVoiceprint'))) {
      return;
    }

    // 精准打印所有参数状态
    console.log('========== 删除声纹参数排查 ==========');
    console.log('jaboboId (props传入):', {
      value: jaboboId,
      type: typeof jaboboId,
      isEmpty: !jaboboId,
      isBlank: typeof jaboboId === 'string' && jaboboId.trim() === ''
    });
    console.log('speakerId (点击传入):', {
      value: speakerId,
      type: typeof speakerId,
      isEmpty: !speakerId,
      isBlank: typeof speakerId === 'string' && speakerId.trim() === ''
    });
    console.log('voiceprintName (点击传入):', {
      value: voiceprintName,
      type: typeof voiceprintName,
      isEmpty: !voiceprintName,
      isBlank: typeof voiceprintName === 'string' && voiceprintName.trim() === ''
    });
    console.log('======================================');

    // 安全校验：3个参数都非空
    const isJaboboIdValid = typeof jaboboId === 'string' && jaboboId.trim() !== '';
    const isSpeakerIdValid = typeof speakerId === 'string' && speakerId.trim() !== '';
    const isVoiceprintNameValid = typeof voiceprintName === 'string' && voiceprintName.trim() !== '';
    
    if (!isJaboboIdValid || !isSpeakerIdValid || !isVoiceprintNameValid) {
      alert(t('voiceprint.error.deleteVoiceprintMissingParams'));
      return;
    }

    try {
      setDeleteVoiceprintLoading(speakerId);
      console.log(`[日志] 开始删除声纹: speakerId=${speakerId}, voiceprintName=${voiceprintName}`);
      
      // 🔥 核心修复2：调用接口时传递3个参数
      const response = await jaboboVoice.deleteRegisteredVoiceprint(
        jaboboId,          // 设备ID
        speakerId,         // 声纹ID（speaker_id）
        voiceprintName     // 声纹名称
      );
      
      console.log(`[日志] 删除声纹响应：`, response);
      
      if (response.success) {
        alert(t('voiceprint.success.deleteVoiceprint'));
        const reloadResponse = await jaboboVoice.listRegisteredVoiceprints(jaboboId);
        if (reloadResponse.success && Array.isArray(reloadResponse.data)) {
          setRegisteredVoiceprints(reloadResponse.data);
        }
      } else {
        alert(`${t('voiceprint.error.deleteVoiceprintFailed')}：${response.message || response.detail}`);
      }
    } catch (error) {
      console.error(`[日志] 删除声纹失败：`, error);
      alert(`${t('voiceprint.error.deleteVoiceprintRequestFailed')}: ${(error as Error).message}`);
    } finally {
      setDeleteVoiceprintLoading('');
    }
  };

  const handleVoiceprintNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value || '';
    setVoiceprintName(inputValue);
  };

  // 音频删除逻辑（无修改）
  const handleDeleteSelectedAudio = async () => {
    if (!window.confirm(t('voiceprint.confirm.deleteAudio'))) {
      return;
    }

    const isJaboboIdValid = typeof jaboboId === 'string' && jaboboId.trim() !== '';
    const isSelectedChatValid = typeof selectedChat === 'string' && selectedChat.trim() !== '';
    
    if (!isJaboboIdValid || !isSelectedChatValid) {
      alert(t('voiceprint.error.deleteMissingParams'));
      return;
    }

    try {
      setIsDeleting(true);
      console.log(`[日志] 开始删除文件: ${selectedChat}`);
      
      const response = await jaboboVoice.deleteAudio(
        jaboboId,
        selectedChat
      );
      
      console.log(`[日志] 删除音频响应：`, response);
      
      if (response.success) {
        alert(t('voiceprint.success.deleteAudio'));
        
        setSelectedChat('');
        setSelectedAudioContent('');
        setIsLoaded(false);
        
        const reloadResponse = await jaboboVoice.listAudio(jaboboId);
        
        if (reloadResponse.success) {
          if (reloadResponse.audio_list && Array.isArray(reloadResponse.audio_list)) {
            setAudioList(reloadResponse.audio_list);
            const newChats = reloadResponse.audio_list.map((item: AudioFile) => ({
              id: item.file_path,
              title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
              duration: '0:00',
              date: item.upload_time.split(' ')[0] || ''
            }));
            setMOCK_CHATS(newChats);
          } else {
            setMOCK_CHATS([]);
            setAudioList([]);
          }
        } else {
          setMOCK_CHATS([]);
          setAudioList([]);
          console.warn(`[日志] 刷新音频列表失败：`, reloadResponse.message || reloadResponse.detail);
        }
      } else {
        alert(`${t('voiceprint.error.deleteFailed')}：${response.message || response.detail}`);
      }
    } catch (error) {
      console.error(`[日志] 删除音频失败：`, error);
      alert(`${t('voiceprint.error.deleteAudioFailed')}: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChat(val);
    
    if (val) {
      const selectedAudio = audioList.find(item => item.file_path === val);
      setSelectedAudioContent(selectedAudio?.audio_content || '');
      
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

  // 🔥 核心修复3：渲染时传递 speaker_id 和 voiceprint_name
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('voiceprint.title')}</h2>
          <p className="text-center text-sm text-gray-500 px-6">
            {t('voiceprint.description')}
          </p>
        </div>

        {/* 音频文件选择区域 */}
        <div className="mb-8">
          <label className="block text-gray-700 font-bold text-sm mb-2">{t('voiceprint.label.selectSource')}</label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 appearance-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedChat}
              onChange={handleChatSelect}
              disabled={isLoading || isRegistering}
            >
              <option value="">{t('voiceprint.placeholder.chooseChat')}</option>
              {isLoading ? (
                <option value="" disabled>{t('voiceprint.loading.audioList')}</option>
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
                <span className="text-xs text-gray-400 font-medium">{t('voiceprint.processing.audio')}</span>
              </div>
            ) : isLoaded ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex space-x-1 mb-3">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <div key={i} className={`w-1 bg-yellow-400 rounded-full h-${h === 1 ? '2' : h === 2 ? '4' : h === 3 ? '6' : h === 4 ? '8' : '10'}`}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-bold mb-3">{t('voiceprint.status.audioLoaded')}</span>
                
                <div className="w-full bg-white rounded-xl p-3 border border-gray-200 mt-2">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-bold text-gray-700">{t('voiceprint.label.audioContent')}</h4>
                    <button
                      onClick={handleDeleteSelectedAudio}
                      disabled={isDeleting || isRegistering}
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
                    {selectedAudioContent || ''}
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
          <div className="animate-in fade-in duration-500 mb-12">
            <Input 
              label={t('voiceprint.label.nameVoiceprint')} 
              placeholder={t('voiceprint.placeholder.voiceprintExample')} 
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
                  <span>{t('voiceprint.button.registering')}</span>
                </>
              ) : (
                <>
                  <Mic2 size={20} className="mr-2" />
                  <span>{t('voiceprint.button.rememberVoiceprint')}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 已注册声纹列表区域 */}
        <div className="mt-10 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">{t('voiceprint.label.registeredVoiceprints')}</h3>
            {isLoadingVoiceprints && (
              <Loader2 size={16} className="text-gray-400 animate-spin" />
            )}
          </div>
          
          {isLoadingVoiceprints ? (
            <div className="py-8 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={24} className="mb-2 animate-spin" />
              <p className="text-sm">{t('voiceprint.loading.registeredVoiceprints')}</p>
            </div>
          ) : registeredVoiceprints.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <XCircle size={32} className="text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">{t('voiceprint.prompt.noRegisteredVoiceprints')}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {registeredVoiceprints.map((voiceprint) => (
                // 🔥 修复：key 改为 speaker_id（唯一标识）
                <div 
                  key={voiceprint.speaker_id} 
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-800">{voiceprint.voiceprint_name}</span>
                        <CheckCircle2 size={14} className="text-green-500 ml-2" />
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{t('voiceprint.label.createTime')}: {formatDateTime(voiceprint.create_time)}</span>
                        <span>{t('voiceprint.label.status')}: {voiceprint.status === 'active' ? t('voiceprint.status.active') : t('voiceprint.status.inactive')}</span>
                      </div>
                    </div>
                    
                    {/* 🔥 修复：传递 speaker_id 和 voiceprint_name 两个参数 */}
                    <button
                      onClick={() => handleDeleteRegisteredVoiceprint(
                        voiceprint.speaker_id,
                        voiceprint.voiceprint_name
                      )}
                      disabled={deleteVoiceprintLoading === voiceprint.speaker_id || isRegistering}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-full transition-colors ml-2"
                      aria-label={t('voiceprint.button.deleteVoiceprint')}
                    >
                      {deleteVoiceprintLoading === voiceprint.speaker_id ? (
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