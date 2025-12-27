import React, { useEffect, useState } from 'react';
import { 
  Waves, 
  Book, 
  UserCircle, 
  Brain, 
  RefreshCw, 
  Plus, 
  Settings2, 
  Users, 
  LogOut 
} from 'lucide-react';
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
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      onNavigate('LOGIN');
    }
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onNavigate('LOGIN');
  };

  if (!currentUser) return null;

  return (
    <Layout className="bg-gray-50 pb-12">
      {/* 顶部：欢迎语和头像区 */}
      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welcome back</span>
            <h2 className="text-xl font-black text-gray-900">{currentUser.username}</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
            currentUser.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {currentUser.role}
          </div>
        </div>

        <div className="relative mb-6">
          <div className="w-56 h-72 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-4">
            <img 
              src="https://raw.githubusercontent.com/jabra-fan/assets/main/jabra-mascot-wink.png" 
              alt="Jobobo Mascot" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md uppercase">
            JOBOBO
          </div>
        </div>
      </div>

      {/* 1. 人设定制 */}
      <div className="px-6 mb-4">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-yellow-500">
              <UserCircle size={20} className="mr-2" />
              <h3 className="font-bold text-gray-800 tracking-tight">人设定制</h3>
            </div>
            <button onClick={onAddPersona} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-yellow-500 transition-colors">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePersonaId(p.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activePersonaId === p.id ? 'bg-yellow-400 text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-400 border border-gray-100'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <textarea 
            value={activePersona.content}
            onChange={(e) => onUpdatePersona(activePersona.id, e.target.value)}
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-50 min-h-[100px]"
          />
        </div>
      </div>

      {/* 2. 记忆输入 */}
      <div className="px-6 mb-6">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center mb-3 text-yellow-500">
            <Brain size={20} className="mr-2" />
            <h3 className="font-bold text-gray-800 tracking-tight">记忆输入</h3>
          </div>
          <textarea 
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-50 min-h-[80px]"
          />
        </div>
      </div>

      {/* 3. 功能按钮网格 */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => onNavigate('VOICEPRINT')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3">
            <Waves size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">声纹设置</span>
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">Voice</span>
        </button>

        <button onClick={() => onNavigate('KNOWLEDGE_BASE')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-3">
            <Book size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">知识库</span>
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">Library</span>
        </button>
      </div>

      {/* 4. 同步按钮 */}
      <div className="px-6 mb-12">
        <button className="w-full yellow-button py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98]">
          <RefreshCw size={22} className="mr-3" />
          <span>Sync Changes</span>
        </button>
      </div>

      {/* 5. 修正后的底部导航栏 */}
      <div className="px-6 border-t border-gray-100 pt-8 flex flex-wrap justify-center items-center gap-y-4 gap-x-8">
        
        {/* 关键修正：普通用户点击这里跳转到设置界面 */}
        <button 
          onClick={() => onNavigate('SETTINGS')} 
          className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          <Settings2 size={16} className="mr-2" />
          Settings
        </button>

        {/* 管理员专属入口 */}
        {currentUser.role === 'Admin' && (
          <button 
            onClick={() => onNavigate('ADMIN')}
            className="flex items-center text-yellow-600 text-[10px] font-black uppercase tracking-widest hover:text-yellow-700 transition-colors"
          >
            <Users size={16} className="mr-2" />
            Admin Console
          </button>
        )}

        <button 
          onClick={handleLogout}
          className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;