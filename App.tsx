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
const INITIAL_PERSONAS: Persona[] = [{ id: 'default', name: 'My AI', content: '' }];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const saved = localStorage.getItem('user');
    return saved ? 'DASHBOARD' : 'LOGIN';
  });

  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [memory, setMemory] = useState('');

  // 更新人设内容
  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  // 添加人设
  const handleAddPersona = () => {
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: `Persona ${personas.length + 1}`,
      content: ''
    };
    setPersonas([...personas, newPersona]);
    setActivePersonaId(newPersona.id);
  };

  // 【核心新增】删除人设逻辑
  const handleDeletePersona = (id: string) => {
    if (personas.length <= 1) {
      alert("至少需要保留一个人设");
      return;
    }
    const filtered = personas.filter(p => p.id !== id);
    setPersonas(filtered);
    // 如果删掉的是当前选中的，自动切到第一个
    if (activePersonaId === id) {
      setActivePersonaId(filtered[0].id);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': return <Login onNavigate={setCurrentScreen} />;
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
            onDeletePersona={handleDeletePersona} // 传递删除函数
            memory={memory} 
            setMemory={setMemory}
          />
        );
      default: return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-8">
      <div className="w-full max-w-6xl bg-white md:rounded-[40px] shadow-2xl min-h-screen md:min-h-[85vh] overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;