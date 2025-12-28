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
  LogOut,
  Loader2,
  ChevronLeft,
  Cpu,
  X // 👈 导入 X 图标用于删除
} from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, Persona } from '../types';
import { UserConfig } from '../api/user';
import { JaboboConfig } from '../api/jabobo_congfig';
import dashboadImg from '../assets/dashboad.png'; 

interface DashboardProps {
  jaboboId: string; 
  onNavigate: (screen: Screen) => void;
  personas: Persona[];
  setPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
  activePersonaId: string;
  setActivePersonaId: (id: string) => void;
  onUpdatePersona: (id: string, content: string) => void;
  onAddPersona: () => void;
  onDeletePersona: (id: string) => void; // 👈 注入删除方法
  memory: string;
  setMemory: (v: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  jaboboId,
  onNavigate, 
  personas, 
  setPersonas,
  activePersonaId, 
  setActivePersonaId,
  onUpdatePersona,
  onAddPersona,
  onDeletePersona, // 👈 逻辑接入
  memory, 
  setMemory 
}) => {
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || { content: '' };
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('加载中...');
  const [kbStatus, setKbStatus] = useState('加载中...');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      fetchServerConfig(); 
    } else {
      onNavigate('LOGIN');
    }
  }, [jaboboId]);

  const fetchServerConfig = async () => {
    try {
      const res = await JaboboConfig.getUserConfig(jaboboId);
      if (res.success && res.data) {
        const rawPersona = res.data.persona;
        try {
          const parsedPersonas = JSON.parse(rawPersona);
          if (Array.isArray(parsedPersonas) && parsedPersonas.length > 0) {
            setPersonas(parsedPersonas);
            setActivePersonaId(parsedPersonas[0].id);
          }
        } catch (e) {
          if (rawPersona && rawPersona !== "[]") {
            setPersonas([{ id: 'server-legacy', name: 'My AI', content: rawPersona }]);
            setActivePersonaId('server-legacy');
          }
        }
        setMemory(res.data.memory || '');
        setVoiceStatus(res.data.voice_status || '已就绪');
        setKbStatus(res.data.kb_status || '已同步');
      }
    } catch (err) {
      console.error("Fetch failed", err);
      setVoiceStatus('未设置');
      setKbStatus('未挂载');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const payload: UserConfig = {
        persona: JSON.stringify(personas), 
        memory: memory,
        voice_status: voiceStatus,
        kb_status: kbStatus
      };
      const res = await JaboboConfig.syncConfig(jaboboId, payload);
      if (res.success) {
        alert("✨ 数据同步成功！");
      }
    } catch (err) {
      alert("同步失败，请检查网络");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('active_jabobo_uuid');
    onNavigate('LOGIN');
  };

  if (!currentUser) return null;

  return (
    <Layout className="bg-gray-50 pb-12">
      {/* 顶部逻辑区 */}
      <div className="bg-white px-6 pt-6 flex justify-between items-center">
        <button 
          onClick={() => onNavigate('SELECT_JABOBO')} 
          className="flex items-center text-gray-400 hover:text-yellow-500 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <ChevronLeft size={16} className="mr-1" />
          Switch Device
        </button>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 font-mono text-[10px] font-bold text-gray-400 uppercase">
          <Cpu size={12} className="text-yellow-500" />
          <span>{jaboboId}</span>
        </div>
      </div>

      {/* 用户信息区 */}
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
              src={dashboadImg} 
              alt="Mascot" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md uppercase">
            Jabobo
          </div>
        </div>
      </div>

      {/* 人设定制区 - 包含删除逻辑 */}
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
              <div key={p.id} className="relative group flex-shrink-0 pt-1 pr-1">
                {/* 人设标签按钮 */}
                <button
                  onClick={() => setActivePersonaId(p.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activePersonaId === p.id 
                      ? 'bg-yellow-400 text-gray-900 shadow-sm border border-yellow-400' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}
                >
                  {p.name}
                </button>

                {/* 删除按钮逻辑：
                    1. personas.length > 1：确保至少保留一个
                    2. group-hover:opacity-100：仅在悬停父级 div 时显示
                    3. opacity-0：常态下完全透明隐藏
                */}
                {personas.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 防止触发标签切换
                      if (window.confirm(`确定删除人设 "${p.name}" 吗？`)) {
                        onDeletePersona(p.id);
                      }
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                              active:scale-90 z-10"
                  >
                    <X size={10} strokeWidth={4} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <textarea 
            value={activePersona.content}
            onChange={(e) => onUpdatePersona(activePersonaId, e.target.value)}
            placeholder="输入人设描述..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-50 min-h-[120px]"
          />
        </div>
      </div>

      {/* 记忆输入 */}
      <div className="px-6 mb-6">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center mb-3 text-yellow-500">
            <Brain size={20} className="mr-2" />
            <h3 className="font-bold text-gray-800 tracking-tight">记忆输入</h3>
          </div>
          <textarea 
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            placeholder="输入 AI 需要记住的信息..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-50 min-h-[80px]"
          />
        </div>
      </div>

      {/* 状态按钮 */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => onNavigate('VOICEPRINT')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md active:scale-95 border border-white relative">
          <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${voiceStatus === '已就绪' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3">
            <Waves size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">声纹设置</span>
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">{voiceStatus}</span>
        </button>

        <button onClick={() => onNavigate('KNOWLEDGE_BASE')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md active:scale-95 border border-white relative">
          <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${kbStatus === '已同步' ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-3">
            <Book size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">知识库</span>
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">{kbStatus}</span>
        </button>
      </div>

      {/* 同步按钮 */}
      <div className="px-6 mb-12">
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full bg-yellow-400 py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-70 text-gray-900"
        >
          {isSyncing ? <Loader2 size={22} className="mr-3 animate-spin" /> : <RefreshCw size={22} className="mr-3" />}
          <span>{isSyncing ? 'Syncing...' : 'Sync All Changes'}</span>
        </button>
      </div>

      {/* 底部导航 */}
      <div className="px-6 border-t border-gray-100 pt-8 flex flex-wrap justify-center items-center gap-y-4 gap-x-8">
        <button onClick={() => onNavigate('SETTINGS')} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900">
          <Settings2 size={16} className="mr-2" />
          Settings
        </button>

        {currentUser.role === 'Admin' && (
          <button onClick={() => onNavigate('ADMIN')} className="flex items-center text-yellow-600 text-[10px] font-black uppercase tracking-widest hover:text-yellow-700">
            <Users size={16} className="mr-2" />
            Admin Console
          </button>
        )}

        <button onClick={handleLogout} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500">
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;