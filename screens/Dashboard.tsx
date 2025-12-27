import React, { useEffect, useState } from 'react';
import { Waves, Book, UserCircle, Brain, RefreshCw, Plus, Settings2, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, Persona } from '../types';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  personas: Persona[];
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;
  onUpdatePersona: (id: string, content: string) => void;
  onAddPersona: () => void;
  memory: string;
  setMemory: (v: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  personas, 
  activePersonaId, 
  setActivePersonaId,
  onUpdatePersona,
  onAddPersona,
  memory, 
  setMemory 
}) => {
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];
  
  // 新增：用于存储当前登录用户的信息
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // 获取登录时保存的用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onNavigate('LOGIN');
  };

  return (
    <Layout className="bg-gray-50 pb-8">
      {/* Header Area with Mascot */}
      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-56 h-72 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-4">
            <img 
              src="https://raw.githubusercontent.com/jabra-fan/assets/main/jabra-mascot-wink.png" 
              alt="Jobobo Mascot" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://img.freepik.com/free-vector/cute-robot-waving-hand-cartoon-character-illustration_138676-2744.jpg";
              }}
            />
          </div>
          <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-animation"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Active</span>
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md">
            JOBOBO
          </div>
        </div>
        {/* 显示当前用户名 */}
        {currentUser && (
          <p className="text-gray-400 text-xs font-bold">Logged in as: {currentUser.username}</p>
        )}
      </div>

      {/* 1. Persona Customization Section */}
      <div className="px-6 mb-4">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-yellow-500">
              <UserCircle size={20} className="mr-2" />
              <h3 className="font-bold text-gray-800">人设定制</h3>
            </div>
            <button 
              onClick={onAddPersona}
              className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePersonaId(p.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePersonaId === p.id 
                    ? 'bg-yellow-400 text-gray-900 shadow-sm' 
                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <textarea 
            value={activePersona.content}
            onChange={(e) => onUpdatePersona(activePersona.id, e.target.value)}
            placeholder={`Describe ${activePersona.name}'s personality...`}
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-100 min-h-[100px] transition-all"
          />
        </div>
      </div>

      {/* 2. Memory Input Section */}
      <div className="px-6 mb-6">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center mb-3 text-yellow-500">
            <Brain size={20} className="mr-2" />
            <h3 className="font-bold text-gray-800">记忆输入</h3>
          </div>
          <textarea 
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            placeholder="Tell Jobobo things to remember..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-100 min-h-[80px] transition-all"
          />
        </div>
      </div>

      {/* 3. Action Buttons Section */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={() => onNavigate('VOICEPRINT')}
          className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Waves size={28} />
          </div>
          <span className="font-bold text-gray-800 text-sm">声纹设置</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Voiceprint</span>
        </button>

        <button 
          onClick={() => onNavigate('KNOWLEDGE_BASE')}
          className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white"
        >
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Book size={28} />
          </div>
          <span className="font-bold text-gray-800 text-sm">知识库</span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Knowledge Base</span>
        </button>
      </div>

      {/* Primary Update Action */}
      <div className="px-6">
        <button 
          onClick={() => alert('Jobobo Updated!')}
          className="w-full yellow-button py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-lg active:scale-[0.98]"
        >
          <RefreshCw size={22} className="mr-3" />
          <span>Sync Changes</span>
        </button>
      </div>

      {/* 底部导航按钮区域 */}
      <div className="mt-8 flex justify-center items-center space-x-6">
        <button 
          onClick={handleLogout} 
          className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-red-400 transition-colors"
        >
          Logout
        </button>

        {/* 关键修改：如果是 Admin，显示用户管理入口 */}
        {currentUser?.role === 'Admin' && (
          <button 
            onClick={() => onNavigate('ADMIN')}
            className="flex items-center text-yellow-600 text-xs font-bold uppercase tracking-widest hover:text-yellow-700 transition-colors border-l border-gray-200 pl-6"
          >
            <Users size={14} className="mr-1" />
            User Management
          </button>
        )}

        <button className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
          Settings
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;