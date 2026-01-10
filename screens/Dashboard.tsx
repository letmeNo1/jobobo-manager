import React, { useEffect, useState, useRef } from 'react';
import { Waves, Book, UserCircle, Brain, RefreshCw, Plus, Settings2, Users, LogOut, Loader2, ChevronLeft, Cpu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 引入i18n钩子
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
  // 获取i18n翻译函数
  const { t } = useTranslation();
  
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || { content: '' };
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(t('dashboard.loading')); // 翻译加载中
  const [kbStatus, setKbStatus] = useState(t('dashboard.loading')); // 翻译加载中
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [tempPersonaName, setTempPersonaName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      fetchServerConfig(); 
    } else {
      onNavigate('LOGIN');
    }
  }, [jaboboId]); 

  useEffect(() => {
    if (editingPersonaId && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingPersonaId]);

  const fetchServerConfig = async () => {
    try {
      const res = await JaboboConfig.getUserConfig(jaboboId);
      if (res.success && res.data) {
        const rawPersona = res.data.persona;
        try {
          const parsed = JSON.parse(rawPersona);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPersonas(parsed);
            setActivePersonaId(parsed[0].id);
          }
        } catch (e) {
          if (rawPersona) {
            setPersonas([{ id: 'default', name: t('dashboard.defaultPersonaName'), content: rawPersona }]); // 翻译默认人设名称
            setActivePersonaId('default');
          }
        }
        setMemory(res.data.memory || '');
        setVoiceStatus(res.data.voice_status || t('dashboard.ready')); // 翻译已就绪
        setKbStatus(res.data.kb_status || t('dashboard.synced')); // 翻译已同步
      }
    } catch (err) { console.error(err); }
  };

  const startEditingPersonaName = (persona: Persona) => {
    setEditingPersonaId(persona.id);
    setTempPersonaName(persona.name);
  };

  const confirmPersonaNameChange = () => {
    if (!editingPersonaId || !tempPersonaName.trim()) return;
    
    setPersonas(prev => prev.map(p => 
      p.id === editingPersonaId 
        ? { ...p, name: tempPersonaName.trim() } 
        : p
    ));
    setEditingPersonaId(null);
  };

  const cancelPersonaNameEdit = () => {
    setEditingPersonaId(null);
    setTempPersonaName('');
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      const selected = personas.find(p => p.id === activePersonaId);
      if (!selected) return;
      const newOrdered = [selected, ...personas.filter(p => p.id !== activePersonaId)];

      const payload: UserConfig = {
        persona: JSON.stringify(newOrdered), 
        memory: memory,
        voice_status: voiceStatus,
        kb_status: kbStatus
      };
      
      const res = await JaboboConfig.syncConfig(jaboboId, payload);
      
      if (res.success) {
        setPersonas(newOrdered);
        alert(`${t('dashboard.syncSuccess')} ${jaboboId.slice(-4)}！`); // 翻译同步成功提示
      }
    } catch (err) {
      alert(t('dashboard.syncFailed')); // 翻译同步失败提示
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
          <ChevronLeft size={16} className="mr-1" /> {t('dashboard.switchDevice')} {/* 翻译切换设备 */}
        </button>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 font-mono text-[10px] font-bold text-gray-400">
          <Cpu size={12} className="text-yellow-500" />
          <span>{jaboboId}</span>
        </div>
      </div>

      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('dashboard.activeDevice')}</span> {/* 翻译活跃设备 */}
            <h2 className="text-xl font-black text-gray-900">{currentUser.username}</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${currentUser.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            {currentUser.role === 'Admin' ? t('dashboard.admin') : t('dashboard.user')} {/* 翻译角色 */}
          </div>
        </div>
        <div className="relative mb-6">
          <div className="w-56 h-72 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-4">
            <img src={dashboadImg} alt={t('dashboard.mascot')} className="w-full h-full object-contain" /> {/* 翻译图片alt */}
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md uppercase">Jabobo</div>
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-yellow-500"><UserCircle size={20} className="mr-2" /><h3 className="font-bold text-gray-800">{t('dashboard.personaCustomization')}</h3></div> {/* 翻译人设定制 */}
            <button onClick={onAddPersona} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-yellow-500 active:scale-95" aria-label={t('dashboard.addPersona')}> {/* 翻译添加人设 */}
              <Plus size={18} />
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {personas.map((p) => (
              <div key={p.id} className="relative group flex-shrink-0 pt-1 pr-1">
                <div
                  onClick={() => setActivePersonaId(p.id)}
                  onDoubleClick={() => startEditingPersonaName(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                    activePersonaId === p.id ? 'bg-yellow-400 text-gray-900 border-yellow-400 shadow-md scale-105' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}
                >
                  {editingPersonaId === p.id ? (
                    <div className="flex items-center justify-between w-[80px]">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={tempPersonaName}
                        onChange={(e) => setTempPersonaName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmPersonaNameChange();
                          if (e.key === 'Escape') cancelPersonaNameEdit();
                        }}
                        onBlur={confirmPersonaNameChange}
                        className="w-full bg-transparent border-none outline-none text-xs font-black"
                        placeholder={t('dashboard.enterName')} // 翻译输入名称
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelPersonaNameEdit();
                        }}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        aria-label={t('dashboard.cancel')} // 翻译取消
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <span>{p.name}</span>
                  )}
                </div>
                {personas.length > 1 && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (window.confirm(t('dashboard.confirmDeletePersona'))) onDeletePersona(p.id); // 翻译删除确认
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label={t('dashboard.delete')} // 翻译删除
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
            placeholder={t('dashboard.personaPlaceholder')} // 翻译人设输入占位符
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center mb-3 text-yellow-500"><Brain size={20} className="mr-2" /><h3 className="font-bold text-gray-800">{t('dashboard.deviceMemory')}</h3></div> {/* 翻译设备记忆 */}
          <textarea 
            value={memory} 
            onChange={(e) => setMemory(e.target.value)} 
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 min-h-[80px] resize-none"
            placeholder={t('dashboard.memoryPlaceholder')} // 翻译记忆输入占位符
          />
        </div>
      </div>

       <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => onNavigate('VOICEPRINT')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3">
            <Waves size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">{t('dashboard.voiceprintSettings')}</span> {/* 翻译声纹设置 */}
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">Voice</span>
        </button>

        <button onClick={() => onNavigate('KNOWLEDGE_BASE')} className="bg-white p-6 rounded-[28px] shadow-sm flex flex-col items-center hover:shadow-md transition-all active:scale-95 border border-white">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-3">
            <Book size={24} />
          </div>
          <span className="font-black text-gray-800 text-xs">{t('dashboard.knowledgeBase')}</span> {/* 翻译知识库 */}
          <span className="text-[9px] text-gray-300 mt-1 font-bold uppercase tracking-widest">Library</span>
        </button>
      </div>

      <div className="px-6 mb-12">
        <button onClick={handleSync} disabled={isSyncing} className="w-full bg-yellow-400 py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-70 text-gray-900 transition-all">
          {isSyncing ? <Loader2 size={22} className="mr-3 animate-spin" /> : <RefreshCw size={22} className="mr-3" />}
          <span>{isSyncing ? t('dashboard.syncing') : t('dashboard.syncToDevice')}</span> {/* 翻译同步相关文本 */}
        </button>
      </div>

      <div className="px-6 border-t border-gray-100 pt-8 flex justify-center gap-x-8">
        <button onClick={() => onNavigate('SETTINGS')} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-900 transition-colors">
          <Settings2 size={16} className="mr-2" /> {t('dashboard.settings')} {/* 翻译设置 */}
        </button>
        
        {currentUser.role === 'Admin' && (
          <button 
            onClick={() => onNavigate('ADMIN')} 
            className="flex items-center text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:text-yellow-600 transition-colors"
          >
            <Users size={16} className="mr-2" /> {t('dashboard.adminPanel')} {/* 翻译管理面板 */}
          </button>
        )}
        
        <button onClick={handleLogout} className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">
          <LogOut size={16} className="mr-2" /> {t('dashboard.signOut')} {/* 翻译退出登录 */}
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;