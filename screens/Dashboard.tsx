import React, { useEffect, useState } from 'react';
import { Waves, Book, UserCircle, Brain, RefreshCw, Plus, Settings2, Users, LogOut, Loader2, ChevronLeft, Cpu, X } from 'lucide-react';
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
  onDeletePersona: (id: string) => void;
  memory: string;
  setMemory: (v: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  jaboboId, onNavigate, personas, setPersonas, activePersonaId, 
  setActivePersonaId, onUpdatePersona, onAddPersona, onDeletePersona, 
  memory, setMemory 
}) => {
  
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || { content: '' };
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('加载中...');
  const [kbStatus, setKbStatus] = useState('加载中...');

  // 💡 当 jaboboId 变动时，必须重新抓取该设备的特定配置
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
      const res = await JaboboConfig.getUserConfig(jaboboId); // 获取当前设备的 JSON
      if (res.success && res.data) {
        const rawPersona = res.data.persona;
        try {
          const parsed = JSON.parse(rawPersona);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPersonas(parsed);
            setActivePersonaId(parsed[0].id); // 选中该设备配置的第一项
          }
        } catch (e) {
          if (rawPersona) {
            setPersonas([{ id: 'default', name: 'My AI', content: rawPersona }]);
            setActivePersonaId('default');
          }
        }
        setMemory(res.data.memory || '');
        setVoiceStatus(res.data.voice_status || '已就绪');
        setKbStatus(res.data.kb_status || '已同步');
      }
    } catch (err) { console.error(err); }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      // 1. 重排当前设备的数组
      const selected = personas.find(p => p.id === activePersonaId);
      if (!selected) return;
      const newOrdered = [selected, ...personas.filter(p => p.id !== activePersonaId)];

      // 2. 仅同步到当前选中的 jaboboId
      const payload: UserConfig = {
        persona: JSON.stringify(newOrdered), 
        memory: memory,
        voice_status: voiceStatus,
        kb_status: kbStatus
      };
      
      const res = await JaboboConfig.syncConfig(jaboboId, payload);
      
      if (res.success) {
        setPersonas(newOrdered);
        alert(`✨ 设备 ${jaboboId.slice(-4)} 配置已更新！`);
      }
    } catch (err) {
      alert("同步失败");
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
      <div className="bg-white px-6 pt-6 flex justify-between items-center">
        <button onClick={() => onNavigate('SELECT_JABOBO')} className="flex items-center text-gray-400 hover:text-yellow-500 font-black text-[10px] uppercase tracking-widest transition-all">
          <ChevronLeft size={16} className="mr-1" /> Switch Device
        </button>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 font-mono text-[10px] font-bold text-gray-400">
          <Cpu size={12} className="text-yellow-500" />
          <span>{jaboboId}</span>
        </div>
      </div>

      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Device</span>
            <h2 className="text-xl font-black text-gray-900">{currentUser.username}</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${currentUser.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            {currentUser.role}
          </div>
        </div>
        <div className="relative mb-6">
          <div className="w-56 h-72 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-4">
            <img src={dashboadImg} alt="Mascot" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md uppercase">Jabobo</div>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-yellow-500"><UserCircle size={20} className="mr-2" /><h3 className="font-bold text-gray-800">人设定制</h3></div>
            <button onClick={onAddPersona} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-yellow-500 active:scale-95"><Plus size={18} /></button>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {personas.map((p) => (
              <div key={p.id} className="relative group flex-shrink-0 pt-1 pr-1">
                <button
                  onClick={() => setActivePersonaId(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                    activePersonaId === p.id ? 'bg-yellow-400 text-gray-900 border-yellow-400 shadow-md scale-105' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}
                >
                  {p.name}
                </button>
                {personas.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(`删除此人设?`)) onDeletePersona(p.id); }}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none min-h-[120px] resize-none"
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center mb-3 text-yellow-500"><Brain size={20} className="mr-2" /><h3 className="font-bold text-gray-800">设备记忆</h3></div>
          <textarea value={memory} onChange={(e) => setMemory(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 min-h-[80px] resize-none" />
        </div>
      </div>

      <div className="px-6 mb-12">
        <button onClick={handleSync} disabled={isSyncing} className="w-full bg-yellow-400 py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-70 text-gray-900 transition-all">
          {isSyncing ? <Loader2 size={22} className="mr-3 animate-spin" /> : <RefreshCw size={22} className="mr-3" />}
          <span>{isSyncing ? '同步中...' : '同步配置到设备'}</span>
        </button>
      </div>

      <div className="px-6 border-t border-gray-100 pt-8 flex justify-center gap-x-8">
        <button onClick={() => onNavigate('SETTINGS')} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-colors">
          <Settings2 size={16} className="mr-2" /> Settings
        </button>
        <button onClick={handleLogout} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">
          <LogOut size={16} className="mr-2" /> Sign Out
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;