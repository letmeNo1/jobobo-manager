import React, { useEffect, useState } from 'react';
import { Users, Lock, LogOut, ChevronRight, Settings } from 'lucide-react';
import { Screen } from '../types';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // 从本地存储读取登录信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      onNavigate('LOGIN'); // 未登录则强制跳转
    }
  }, [onNavigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    onNavigate('LOGIN');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">你好, {user.username}</h1>
          <div className="flex items-center mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-md ${
              user.role === 'Admin' ? 'bg-yellow-400 text-gray-900' : 'bg-blue-500 text-white'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:shadow-md transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* 功能卡片区域 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. 公共功能：修改密码 (所有人可见) */}
        <div 
          onClick={() => onNavigate('ADMIN')} 
          className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Lock size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-800">安全设置</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">管理您的账户安全，定期修改登录密码。</p>
          <div className="mt-6 flex items-center text-blue-500 font-bold text-xs uppercase tracking-widest">
            进入设置 <ChevronRight size={14} className="ml-1" />
          </div>
        </div>

        {/* 2. 管理员功能：用户管理 (仅 Admin 可见) */}
        {user.role === 'Admin' && (
          <div 
            onClick={() => onNavigate('ADMIN')}
            className="bg-gray-900 p-8 rounded-[40px] shadow-2xl cursor-pointer hover:scale-[1.03] transition-all group"
          >
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mb-6 text-gray-900">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-black text-white">用户管理</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">创建新用户、审核权限以及删除过期账号。</p>
            <div className="mt-6 flex items-center text-yellow-400 font-bold text-xs uppercase tracking-widest">
              进入控制台 <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        )}

        {/* 3. 示例功能：系统日志 (仅 Admin 可见) */}
        {user.role === 'Admin' && (
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Settings size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-800">系统审计</h3>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">查看服务器运行状态与外部调用日志。</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;