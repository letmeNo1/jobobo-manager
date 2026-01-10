import React, { useState, useEffect } from 'react';
import { ChevronLeft, Lock, Save, Loader2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 引入i18n钩子
import { Screen } from '../types';
import { userManagementApi } from '../api/user';

interface SettingsProps {
  onNavigate: (screen: Screen) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  // 获取i18n翻译函数
  const { t } = useTranslation();
  
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
      setMessage({ type: 'error', text: t('settings.error.passwordLength') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('settings.error.passwordMismatch') });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
        // 显式传递对象
        const res = await userManagementApi.updatePassword({
          username: currentUser.username,
          new_password: newPassword  // 确保这里的变量名是 newPassword
    });

      if (res.success) {
        setMessage({ type: 'success', text: t('settings.success.passwordUpdated') });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || t('settings.error.updateFailed') });
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
          aria-label={t('settings.button.back')}
        >
          <ChevronLeft size={16} className="mr-1" /> {t('settings.button.back')}
        </button>

        <h1 className="text-2xl font-black text-gray-900 mb-8">{t('settings.title.accountSettings')}</h1>

        {/* User Profile Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-gray-900">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">{currentUser?.username}</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {currentUser?.role} {t('settings.label.account')}
              </span>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center mb-6 text-gray-800">
            <Lock size={20} className="mr-2" />
            <h3 className="font-bold">{t('settings.title.changePassword')}</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('settings.label.newPassword')}
              </label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder={t('settings.placeholder.newPassword')}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('settings.label.confirmNewPassword')}
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-yellow-400 transition-all"
                placeholder={t('settings.placeholder.confirmPassword')}
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
              {t('settings.button.saveNewPassword')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;