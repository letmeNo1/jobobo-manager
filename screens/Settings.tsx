import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Save, Loader2, User } from 'lucide-react';
import { Screen } from '../types';
import { userManagementApi } from '../api/user';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '密码长度至少需要 6 位' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await userManagementApi.updatePassword({
        username: currentUser.username,
        new_password: newPassword
      });

      if (res.success) {
        setMessage({ type: 'success', text: '密码已成功更新！' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '更新失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <button 
          onClick={() => onNavigate('DASHBOARD')}
          className="flex items-center text-gray-500 hover:text-gray-900 font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" /> Back
        </button>

        <h1 className="text-2xl font-black text-gray-900 mb-8">账户设置</h1>

        {/* User Profile Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-gray-900">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">{currentUser?.username}</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {currentUser?.role} Account
              </span>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center mb-6 text-gray-800">
            <Lock size={20} className="mr-2" />
            <h3 className="font-bold">修改登录密码</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">新密码</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="输入 6 位以上新密码"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">确认新密码</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder="再次输入以确认"
                required
              />
            </div>

            {message && (
              <div className={`text-xs font-bold p-4 rounded-xl ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-yellow-400 py-4 rounded-2xl font-black text-sm mt-4 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
              保存新密码
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;