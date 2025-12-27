import React, { useState, useEffect } from 'react';
import { Screen, Persona } from './types';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Dashboard from './screens/Dashboard';
import Voiceprint from './screens/Voiceprint';
import KnowledgeBase from './screens/KnowledgeBase';
import AdminUserManagement from './screens/AdminUserManagement';
import Settings from './screens/Settings'; 

// 初始占位符
const INITIAL_PERSONAS: Persona[] = [
  { id: 'default', name: 'My AI', content: '' }
];

const App: React.FC = () => {
  // 【关键修复 1】初始状态通过匿名函数读取本地存储
  // 这样刷新页面时，如果已登录，会直接停留在 DASHBOARD 而不是跳回 LOGIN
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? 'DASHBOARD' : 'LOGIN';
  });

  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [memory, setMemory] = useState('');

  // 处理人设内容更新
  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  // 添加新人设
  const handleAddPersona = () => {
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: `New Persona ${personas.length + 1}`,
      content: ''
    };
    setPersonas(prev => [...prev, newPersona]);
    setActivePersonaId(newPersona.id);
  };

  // 渲染屏幕逻辑
  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': 
        return <Login onNavigate={setCurrentScreen} />;
      
      case 'SIGNUP': 
        return <SignUp onNavigate={setCurrentScreen} />;
      
      case 'DASHBOARD':
        return (
          <Dashboard 
            onNavigate={setCurrentScreen} 
            personas={personas}
            setPersonas={setPersonas}
            activePersonaId={activePersonaId}
            setActivePersonaId={setActivePersonaId}
            onUpdatePersona={handleUpdatePersona}
            onAddPersona={handleAddPersona}
            memory={memory}
            setMemory={setMemory}
          />
        );

      case 'VOICEPRINT': 
        return <Voiceprint onNavigate={setCurrentScreen} />;
      
      case 'KNOWLEDGE_BASE': 
        return <KnowledgeBase onNavigate={setCurrentScreen} />;
      
      case 'ADMIN': 
        return <AdminUserManagement onNavigate={setCurrentScreen} />;
      
      case 'SETTINGS': 
        return <Settings onNavigate={setCurrentScreen} />;

      default: 
        return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-8">
      {/* 外层容器：
          - 移动端全屏 (w-full, min-h-screen)
          - 桌面端带圆角和最大宽度 (max-w-6xl, md:rounded-[40px])
      */}
      <div className="w-full max-w-full md:max-w-6xl bg-white overflow-hidden md:rounded-[40px] shadow-2xl min-h-screen md:min-h-[85vh] transition-all relative">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;