
import React, { useState } from 'react';
import { ArrowLeft, UserPlus, ChevronDown, Mic2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, ChatHistory } from '../types';
import Input from '../components/Input';

interface VoiceprintProps {
  onNavigate: (screen: Screen) => void;
}

const MOCK_CHATS: ChatHistory[] = [
  { id: '1', title: '2023-10-25: Morning Chat', duration: '0:45', date: '2023-10-25' },
  { id: '2', title: '2023-10-24: Story Time', duration: '2:10', date: '2023-10-24' },
  { id: '3', title: '2023-10-23: Weather Discussion', duration: '0:30', date: '2023-10-23' },
];

const Voiceprint: React.FC<VoiceprintProps> = ({ onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
            Select a conversation segment to train Jobobo's voice recognition model.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-bold text-sm mb-2">Select Conversation Source</label>
          <div className="relative">
            <select 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 appearance-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={selectedChat}
              onChange={handleChatSelect}
            >
              <option value="">Choose a recent chat...</option>
              {MOCK_CHATS.map(chat => (
                <option key={chat.id} value={chat.id}>{chat.title} ({chat.duration})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* Audio Visualizer Placeholder */}
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
