import React, { useState, useEffect } from 'react';
import { Plus, Cpu, LogOut, Link as LinkIcon, X, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen } from '../types';
import { jaboboApi } from '../api/user'; // 👈 引入 API

interface JaboboSelectorProps {
  onSelect: (uuid: string) => void;
  onNavigate: (screen: Screen) => void;
}

const JaboboSelector: React.FC<JaboboSelectorProps> = ({ onSelect, onNavigate }) => {
  // 1. 状态管理：从 null 开始，加载后更新
  const [uuids, setUuids] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBinding, setIsBinding] = useState(false);
  const [inputUuid, setInputUuid] = useState('');

  // 2. 获取数据：组件加载时向后端请求“我有几个捷宝宝”
  useEffect(() => {
    fetchJaboboList();
  }, []);

  const fetchJaboboList = async () => {
    setIsLoading(true);
    try {
      const res = await jaboboApi.getJaboboIds(); // 调用 API 获取 ID 列表
      if (res.success && Array.isArray(res.jabobo_ids)) {
        setUuids(res.jabobo_ids);
      }
    } catch (err) {
      console.error("获取设备列表失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 绑定逻辑：调用 API 绑定后重新刷新列表
  const handleBind = async () => {
    const val = inputUuid.trim().toUpperCase();
    if (!val) return;
    
    try {
      const res = await jaboboApi.bindJabobo(val); // 调用后端绑定接口
      if (res.success) {
        await fetchJaboboList(); // 成功后重新拉取列表
        setIsBinding(false);
        setInputUuid('');
      } else {
        alert(res.message || "绑定失败");
      }
    } catch (err) {
      alert("网络错误，请重试");
    }
  };

  return (
    <Layout className="bg-white h-full flex flex-col p-8 md:p-12">
      {/* 顶部标题栏 - 保持你的原始设计 */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase">Select Your Jabobo</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">选择要管理的实体设备</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); onNavigate('LOGIN'); }} 
          className="p-4 text-gray-300 hover:text-red-500 transition-colors"
        >
          <LogOut size={28}/>
        </button>
      </div>

      {/* 设备列表网格 - 适配你的 6xl 容器 */}
      <div className="flex-1 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-yellow-400" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 动态渲染：有几个 ID 就渲染几个卡片 */}
            {uuids.map(uuid => (
              <div 
                key={uuid} 
                onClick={() => onSelect(uuid)}
                className="group bg-gray-50 border-2 border-transparent hover:border-yellow-400 p-10 rounded-[40px] transition-all cursor-pointer shadow-sm hover:shadow-xl"
              >
                <div className="w-20 h-20 bg-gray-900 rounded-[24px] flex items-center justify-center text-yellow-400 mb-8 group-hover:scale-110 transition-transform shadow-lg">
                  <Cpu size={40} />
                </div>
                <div className="font-black text-2xl text-gray-900 italic tracking-tight mb-2 uppercase">Jabobo Unit</div>
                <div className="font-mono text-sm text-gray-400 font-bold tracking-widest">{uuid}</div>
              </div>
            ))}

            {/* 绑定新设备入口 */}
            {!isBinding ? (
              <button 
                onClick={() => setIsBinding(true)}
                className="border-2 border-dashed border-gray-100 p-10 rounded-[40px] flex flex-col items-center justify-center text-gray-300 hover:border-yellow-400 hover:text-yellow-400 transition-all min-h-[260px]"
              >
                <Plus size={48} />
                <span className="font-black text-xs uppercase tracking-widest mt-4">Bind New Entity</span>
              </button>
            ) : (
              <div className="lg:col-span-1 bg-yellow-50 border-2 border-yellow-400 p-10 rounded-[40px] flex flex-col justify-center animate-in zoom-in-95">
                 <div className="flex justify-between items-center mb-8">
                   <span className="font-black text-sm text-yellow-700 uppercase tracking-widest flex items-center">
                     <LinkIcon size={18} className="mr-3"/> Link Device
                   </span>
                   <button onClick={() => setIsBinding(false)}><X size={20}/></button>
                 </div>
                 <input 
                   autoFocus 
                   value={inputUuid} 
                   onChange={(e) => setInputUuid(e.target.value)}
                   className="w-full bg-white rounded-2xl px-6 py-4 font-bold text-gray-900 shadow-inner outline-none mb-4"
                   placeholder="Enter UUID (e.g. JB-101)"
                 />
                 <button onClick={handleBind} className="bg-gray-900 text-yellow-400 py-4 rounded-2xl font-black text-xs uppercase active:scale-95 transition-all">
                   Confirm
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JaboboSelector;