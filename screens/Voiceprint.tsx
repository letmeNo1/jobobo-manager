import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, ChevronDown, Mic2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, ChatHistory } from '../types';
import Input from '../components/Input';
// 导入音频API（确保路径正确）
import { jaboboVoice } from '../api/jabobo_voice';

interface VoiceprintProps {
  onNavigate: (screen: Screen) => void;
  jaboboId: string;
}

const Voiceprint: React.FC<VoiceprintProps> = ({ onNavigate, jaboboId }) => {
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // 保留原变量名，改为状态变量
  const [MOCK_CHATS, setMOCK_CHATS] = useState<ChatHistory[]>([]);
  // 新增加载状态（和知识库对齐）
  const [isLoading, setIsLoading] = useState(true);

  // 调用真实接口获取声纹列表（对齐知识库的请求逻辑）
  useEffect(() => {
    const fetchVoiceprintList = async () => {
      // 1. 仅校验jaboboId（和知识库一致）
      if (!jaboboId) {
        console.log("[声纹请求] jaboboId为空，终止请求");
        setIsLoading(false);
        return;
      }

      // 2. 自动从localStorage获取认证信息（无需父组件传）
      const xUsername = localStorage.getItem("username") || "";
      const authorization = localStorage.getItem("auth_token") || "";

      // 3. 打印日志，确认参数（排查用）
      console.log("[声纹请求] 参数信息：", {
        jaboboId,
        xUsername,
        authorization
      });

      setIsLoading(true);
      try {
        // 4. 调用真实接口（和知识库的API调用逻辑对齐）
        const response = await jaboboVoice.listAudio(
          jaboboId,
          xUsername,
          authorization
        );

        console.log("[声纹请求] 接口返回：", response);

        // 5. 处理接口返回数据
        if (response.success && response.audio_list && Array.isArray(response.audio_list)) {
          // 映射为原ChatHistory格式
          const realData: ChatHistory[] = response.audio_list.map((item: any) => ({
            id: item.file_path,
            title: `${item.upload_time.split(' ')[0]}: ${item.file_name}`,
            duration: '0:00', // 保留原格式
            date: item.upload_time.split(' ')[0] || '未知时间'
          }));
          setMOCK_CHATS(realData);
        } else {
          setMOCK_CHATS([]);
          console.warn("[声纹请求] 无音频数据：", response.message || "空数据");
        }
      } catch (error) {
        // 6. 错误处理（和知识库对齐）
        console.error("[声纹请求] 获取列表失败：", error);
        setMOCK_CHATS([]);
        alert(`加载声纹列表失败: ${(error as Error).message || '网络异常'}`);
      } finally {
        setIsLoading(false);
      }
    };

    // 执行请求
    fetchVoiceprintList();
  }, [jaboboId]); // 仅监听jaboboId（和知识库一致）

  // 保留原有选择逻辑完全不变
  const handleChatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedChat(val);
    if (val) {
      setIsProcessing(true);
      setIsLoaded(false);
      setTimeout(() => {
        setIsProcessing(false);
        setIsLoaded(true);
      }, 2000);
    }
  };

  // 完整渲染逻辑（无任何省略）
  return (
    <Layout className="bg-white">
      <div className="p-6">
        <button onClick={() => onNavigate('DASHBOARD')} className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <UserPlus size={32} />
          </div>
          <p className="text-center text-sm text-gray-500 px-6">
            Select a conversation segment to train Jabobo's voice recognition model.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-bold text-sm mb-2">Select Conversation Source</label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 appearance-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedChat}
              onChange={handleChatSelect}
              disabled={isLoading} // 加载中禁用下拉框（和知识库对齐）
            >
              <option value="">Choose a recent chat...</option>
              {/* 加载中显示提示（和知识库对齐） */}
              {isLoading ? (
                <option value="" disabled>Loading audio list...</option>
              ) : (
                MOCK_CHATS.map(chat => (
                  <option key={chat.id} value={chat.id}>{chat.title} ({chat.duration})</option>
                ))
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Audio Visualizer Placeholder - 完整保留 */}
        <div className="mb-8">
          <div className="w-full bg-gray-100 rounded-[24px] h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-6 bg-yellow-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">Processing Audio...</span>
              </div>
            ) : isLoaded ? (
              <div className="flex flex-col items-center">
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                    <div key={i} className={`w-1 bg-yellow-400 rounded-full h-${h === 1 ? '2' : h === 2 ? '4' : h === 3 ? '6' : h === 4 ? '8' : '10'}`}></div>
                  ))}
                </div>
                <span className="text-xs text-gray-600 font-bold">Audio Loaded</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <Mic2 size={32} className="mb-2" />
                <span className="text-xs">Select a file...</span>
              </div>
            )}
          </div>
        </div>

        {isLoaded && (
          <div className="animate-in fade-in duration-500">
            <Input label="Name this Voiceprint" placeholder="e.g., Master's Voice" />
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="w-full yellow-button py-4 rounded-2xl flex items-center justify-center font-bold mt-4 shadow-sm"
            >
              <Mic2 size={20} className="mr-2" />
              <span>Remember Voiceprint</span>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Voiceprint;