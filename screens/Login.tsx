import React, { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import Input from '../components/Input';
import { Screen } from '../types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 注意：这里使用相对路径 /api，Nginx 会帮我们转发到 5000 端口
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 登录成功：将用户信息和角色存入 localStorage 供全应用使用
        localStorage.setItem('user', JSON.stringify({
          username: result.username,
          role: result.role
        }));
        
        // 跳转到主界面
        onNavigate('DASHBOARD');
      } else {
        setError(result.detail || '用户名或密码错误');
      }
    } catch (err) {
      setError('无法连接到服务器，请检查后端状态');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-yellow-400 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-200">
            <LogIn size={40} className="text-gray-900" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">JOBOBO</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Username" 
            placeholder="输入账号" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="输入密码" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full yellow-button py-5 rounded-3xl font-black text-lg shadow-xl active:scale-[0.98] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? '正在验证...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => onNavigate('SIGNUP')}
            className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center text-gray-300">
        <ShieldCheck size={16} className="mr-2" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Admin Access</span>
      </div>
    </div>
  );
};

export default Login;