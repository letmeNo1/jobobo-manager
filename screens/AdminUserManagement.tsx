import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, ChevronLeft, Loader2, RefreshCw, Key } from 'lucide-react';
import { Screen } from '../types';
import { userManagementApi, User } from '../api/user';

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

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. 刷新用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await userManagementApi.getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        alert(result.detail || '获取失败');
      }
    } catch (err: any) {
      alert(err.message || '无法连接到服务器');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. 处理创建用户
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create');
    try {
      const res = await userManagementApi.createUser({
        username: newUsername,
        password: newPassword,
        role: newRole
      });
      if (res.success) {
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. 处理管理员修改密码
  const handleResetPassword = async (targetUsername: string) => {
    const newPwd = window.prompt(`请输入用户 "${targetUsername}" 的新密码:`);
    if (!newPwd) return;
    if (newPwd.length < 6) {
      alert("密码长度不能少于6位");
      return;
    }

    setActionLoading(targetUsername);
    try {
      const res = await userManagementApi.updatePassword({
        username: targetUsername,
        new_password: newPwd
      });
      if (res.success) alert(`用户 ${targetUsername} 的密码修改成功！`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // 4. 处理删除用户
  const handleDeleteUser = async (targetUsername: string) => {
    if (!window.confirm(`确认删除用户 ${targetUsername}？此操作不可撤销。`)) return;
    
    setActionLoading(targetUsername);
    try {
      const res = await userManagementApi.deleteUser(targetUsername);
      if (res.success) fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* 顶部导航 */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> 返回首页
        </button>
        <button 
          onClick={fetchUsers} 
          className={`text-gray-400 hover:text-gray-900 transition-all ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：新建成员表单 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 sticky top-8">
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
                  placeholder="最少 6 位"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">权限级别</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                >
                  <option value="User">普通用户 (User)</option>
                  <option value="Admin">管理员 (Admin)</option>
                </select>
              </div>
              <button 
                type="submit"
                disabled={actionLoading === 'create'}
                className="w-full bg-gray-900 text-yellow-400 py-4 rounded-2xl font-black text-sm mt-4 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {actionLoading === 'create' ? '正在创建...' : '确认添加成员'}
              </button>
            </form>
          </div>
        </div>

        {/* 右侧：用户列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] p-2 shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">用户信息</th>
                  <th className="text-left py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">角色</th>
                  <th className="text-right py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">操作管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading && users.length === 0 ? (
                  <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-yellow-400" /></td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-6 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 mr-4">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-gray-800">{user.username}</div>
                          <div className="text-[10px] text-gray-400 font-bold tracking-tight">{user.create_time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                        user.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right space-x-1">
                      {/* 修改密码按钮 */}
                      <button 
                        onClick={() => handleResetPassword(user.username)}
                        disabled={actionLoading === user.username}
                        className="p-2 text-gray-300 hover:text-yellow-500 transition-colors"
                        title="修改密码"
                      >
                        <Key size={18} />
                      </button>

                      {/* 删除按钮：禁止删除当前登录的管理员 */}
                      {user.username !== currentUser.username && (
                        <button 
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={actionLoading === user.username}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          title="删除成员"
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