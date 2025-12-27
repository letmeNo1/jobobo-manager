import React, { useEffect, useState } from 'react';
import { 
  Waves, 
  Book, 
  UserCircle, 
  Brain, 
  RefreshCw, 
  Plus, 
  LogOut,
  Loader2,
  X 
} from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, Persona } from '../types';
import { configApi, UserConfig } from '../api/user';
import dashboad from '../assets/dashboad.png';

interface DashboardProps {
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
  onNavigate, 
  personas, 
  setPersonas,
  activePersonaId, 
  setActivePersonaId,
  onUpdatePersona,
  onAddPersona,
  onDeletePersona,
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
  }, []);

  const fetchServerConfig = async () => {
    try {
      const res = await configApi.getUserConfig();
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
      const res = await configApi.syncConfig(payload);
      if (res.success) alert("✨ 数据同步成功！");
    } catch (err) {
      alert("同步失败，请检查网络");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 退出登录逻辑 ---
  const handleLogout = async () => {
    if (window.confirm("确定要退出当前账号吗？")) {
      try {
        // 调用后端退出接口（需在 configApi 中定义 logout 方法）
        // 对应后端 auth.py 的 @router.post("/logout")
        await configApi.logout?.(); 
      } catch (err) {
        console.error("Logout request failed", err);
      } finally {
        // 无论后端是否成功，前端本地必须清理
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // 清理 Token
        onNavigate('LOGIN');
      }
    }
  };

  if (!currentUser) return null;

  return (
    <Layout className="bg-gray-50 pb-12">
      {/* 顶部用户信息部分 */}
      <div className="bg-white p-6 pb-12 rounded-b-[40px] shadow-sm mb-6 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welcome back</span>
            <h2 className="text-xl font-black text-gray-900">{currentUser.username}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
              currentUser.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {currentUser.role}
            </div>
            {/* 登出按钮 */}
            <button 
              onClick={handleLogout}
              className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 active:scale-95 transition-all shadow-sm border border-red-100/50"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="w-56 h-72 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center p-4">
            <img src={dashboad} alt="Mascot" className="w-full h-full object-contain" />
          </div>
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-6 py-1 rounded-full font-black text-sm shadow-md uppercase">
            Jabobo
          </div>
        </div>
      </div>

      {/* 1. 多人设 Tab 切换区 */}
      <div className="px-6 mb-4">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-yellow-500">
              <UserCircle size={20} className="mr-2" />
              <h3 className="font-bold text-gray-800 tracking-tight">人设定制</h3>
            </div>
            <button onClick={onAddPersona} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-yellow-500 transition-all active:scale-95">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
            {personas.map(p => (
              <div key={p.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setActivePersonaId(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activePersonaId === p.id 
                      ? 'bg-yellow-400 text-gray-900 shadow-sm' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}
                >
                  {p.name}
                </button>
                
                {personas.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`确定删除 "${p.name}" 吗？`)) {
                        onDeletePersona(p.id);
                      }
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
            placeholder="输入 AI 需要记住的信息..."
            className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 border border-gray-50 min-h-[80px]"
          />
        </div>
      </div>

      {/* 3. 状态按钮部分 */}
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

      {/* 4. 同步按钮 */}
      <div className="px-6 mb-12">
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-70 transition-all"
        >
          {isSyncing ? <Loader2 size={22} className="mr-3 animate-spin" /> : <RefreshCw size={22} className="mr-3" />}
          <span>{isSyncing ? 'Syncing...' : 'Sync All Changes'}</span>
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;