import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import Input from '../components/Input';
import { Screen } from '../types';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import logoImg from '../assets/login.png';
// 1. 导入多语言相关依赖 + 封装好的语言切换组件
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher'; // 新增：导入通用组件
import '../i18n'; // 确保导入i18n配置

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}



const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth(onNavigate);
  // 2. 仅保留翻译函数（移除i18n实例，因为切换逻辑移到组件内）
  const { t } = useTranslation();

  // 移除：手动的changeLanguage函数（组件内已封装）

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authApi.login(username, password);
      if (result.success) {
        login({ 
          username: result.username, 
          role: result.role,
          token: result.token 
        });
      }
    } catch (err: any) {
      // 使用翻译文本作为默认错误提示
      setError(err.message || t('login.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 relative">
      {/* 5. 替换：手动按钮 → 通用LanguageSwitcher组件（自动显示，无需传参） */}
      <div className="absolute top-6 right-6">
        <LanguageSwitcher 
          onLanguageChange={() => setError('')} // 切换语言时清空错误提示
        />
      </div>

      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-200 overflow-hidden p-2">
            <img 
              src={logoImg} 
              alt={`${t('login.title')} Logo`} 
              className="w-full h-full object-contain" 
            />
          </div>
          {/* 替换硬编码文本为翻译函数（保留） */}
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">{t('login.title')}</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label={t('login.usernameLabel')} 
            placeholder={t('login.usernamePlaceholder')} 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input 
            label={t('login.passwordLabel')} 
            type="password" 
            placeholder={t('login.passwordPlaceholder')} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-4 rounded-2xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-5 rounded-3xl font-black text-lg shadow-xl active:scale-[0.98] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {/* 动态显示登录按钮文本（保留） */}
            {loading ? t('login.loginLoading') : t('login.loginButton')}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onNavigate('SIGNUP')}
            className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            {t('login.createAccount')}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center text-gray-300">
        <ShieldCheck size={16} className="mr-2" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{t('login.secureAccess')}</span>
      </div>
    </div>
    
  );
};

export default Login;