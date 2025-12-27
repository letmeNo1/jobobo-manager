
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Input from '../components/Input';
import { Screen } from '../types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onNavigate('DASHBOARD');
      setLoading(false);
    }, 1500);
  };

  return (
    <Layout className="px-8 pt-20 bg-white">
      <div className="flex flex-col items-center mb-12">
        <div className="w-32 h-32 bg-gray-50 rounded-[40px] p-4 mb-6 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
          <img 
            src="https://raw.githubusercontent.com/jabra-fan/assets/main/jabra-mascot-wink.png" 
            alt="Jobobo Mascot" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://img.freepik.com/free-vector/cute-robot-waving-hand-cartoon-character-illustration_138676-2744.jpg";
            }}
          />
        </div>
        <h1 className="text-3xl font-black text-gray-800 mb-1">Jobobo</h1>
        <p className="text-gray-400 font-medium">Manage your AI Companion</p>
      </div>

      <div className="space-y-1">
        <Input 
          label="Email / Phone" 
          placeholder="user@example.com" 
          icon={<User size={20} />} 
        />
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          icon={<Lock size={20} />} 
        />
      </div>

      <div className="flex justify-end mb-8">
        <button className="text-yellow-500 text-sm font-bold hover:underline transition-all">Forgot Password?</button>
      </div>

      <button 
        onClick={handleLogin}
        disabled={loading}
        className="w-full yellow-button py-5 rounded-3xl flex items-center justify-center font-black text-lg shadow-xl active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Logging in...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight size={22} />
          </div>
        )}
      </button>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm font-medium">
          New here? {' '}
          <button 
            onClick={() => onNavigate('SIGNUP')}
            className="text-yellow-500 font-black"
          >
            Create Account
          </button>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
