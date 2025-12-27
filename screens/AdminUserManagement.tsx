import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, Key, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { Screen } from '../types';

interface User {
  id: number;
  username: string;
  role: string;
  create_time: string;
}

interface AdminProps {
  onNavigate: (screen: Screen) => void;
}

const AdminUserManagement: React.FC<AdminProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // 表单状态
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('User');

  // 获取当前登录用户信息（用于 Header 鉴权）
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: { 'x-username': currentUser.username }
      });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        alert(result.detail || '获取列表失败');
      }
    } catch (err) {
      alert('无法连接到服务器');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. 创建用户
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create');
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': currentUser.username
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole
        })
      });
      const result = await response.json();
      if (result.success) {
        setNewUsername('');
        setNewPassword('');
        fetchUsers(); // 刷新列表
      } else {
        alert(result.detail);
      }
    } finally {
      setActionLoading(null);
    }
  };

  // 3. 删除用户
  const handleDeleteUser = async (targetUsername: string) => {
    if (!window.confirm(`确定要删除用户 ${targetUsername} 吗？`)) return;
    
    setActionLoading(targetUsername);
    try {
      const response = await fetch(`/api/users/${targetUsername}`, {
        method: 'DELETE',
        headers: { 'x-username': currentUser.username }
      });
      const result = await response.json();
      if (result.success) {
        fetchUsers();
      } else {
        alert(result.detail);
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* 顶部导航 */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back to Home
        </button>
        <button onClick={fetchUsers} className="text-gray-400 hover:rotate-180 transition-all duration-500">
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：创建用户表单 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center mb-6 text-gray-900">
              <UserPlus size={24} className="mr-3" />
              <h2 className="text-xl font-black">新建成员</h2>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">用户名</label>
                <input 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                  placeholder="设置登录名"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">初始密码</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                  placeholder="设置初始密码"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">角色分配</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all appearance-none"
                >
                  <option value="User">普通用户 (User)</option>
                  <option value="Admin">管理员 (Admin)</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={actionLoading === 'create'}
                className="w-full bg-gray-900 text-yellow-400 py-4 rounded-2xl font-black text-sm mt-4 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {actionLoading === 'create' ? '正在创建...' : '确认添加'}
              </button>
            </form>
          </div>
        </div>

        {/* 右侧：用户列表展示 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] p-2 shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">用户信息</th>
                  <th className="text-left py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">角色</th>
                  <th className="text-right py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 mr-4">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-gray-800">{user.username}</div>
                          <div className="text-[10px] text-gray-400 font-bold">{user.create_time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-tighter ${
                        user.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      {user.username !== currentUser.username && (
                        <button 
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={actionLoading === user.username}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;