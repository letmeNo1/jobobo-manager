import React, { useState, useEffect } from 'react';
import { Screen, Persona } from './types';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Dashboard from './screens/Dashboard';
import Voiceprint from './screens/Voiceprint';
import KnowledgeBase from './screens/KnowledgeBase';
import AdminUserManagement from './screens/AdminUserManagement';
import Settings from './screens/Settings'; 
import JaboboSelector from './screens/JaboboSelector'; // 引入新页面

const INITIAL_PERSONAS: Persona[] = [
  { id: 'default', name: 'My AI', content: '' }
];

const App: React.FC = () => {
  // 逻辑流：如果存了 UUID 直接进 Dashboard，存了 User 没存 UUID 进 Selector，啥都没存进 Login
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedUser = localStorage.getItem('user');
    const savedUuid = localStorage.getItem('active_jabobo_uuid');
    if (!savedUser) return 'LOGIN';
    return savedUuid ? 'DASHBOARD' : 'SELECT_JABOBO';
  });

  const [selectedUuid, setSelectedUuid] = useState<string | null>(localStorage.getItem('active_jabobo_uuid'));
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [memory, setMemory] = useState('');

  // 同步本地存储
  useEffect(() => {
    if (selectedUuid) localStorage.setItem('active_jabobo_uuid', selectedUuid);
  }, [selectedUuid]);

  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  const handleAddPersona = () => {
    const newId = Date.now().toString();
    setPersonas(prev => [...prev, { id: newId, name: `Persona ${prev.length + 1}`, content: '' }]);
    setActivePersonaId(newId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': return <Login onNavigate={setCurrentScreen} />;
      case 'SIGNUP': return <SignUp onNavigate={setCurrentScreen} />;
      case 'SELECT_JABOBO': 
        return <JaboboSelector 
          onSelect={(uuid) => { setSelectedUuid(uuid); setCurrentScreen('DASHBOARD'); }} 
          onNavigate={setCurrentScreen} 
        />;
      case 'DASHBOARD':
        return (
          <Dashboard 
            jaboboId={selectedUuid || ''} // 注入 UUID
            onNavigate={(screen) => {
              if (screen === 'SELECT_JABOBO') {
                localStorage.removeItem('active_jabobo_uuid');
                setSelectedUuid(null);
              }
              setCurrentScreen(screen);
            }} 
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
      case 'VOICEPRINT': return <Voiceprint onNavigate={setCurrentScreen} />;
      case 'KNOWLEDGE_BASE': return <KnowledgeBase onNavigate={setCurrentScreen} />;
      case 'ADMIN': return <AdminUserManagement onNavigate={setCurrentScreen} />;
      case 'SETTINGS': return <Settings onNavigate={setCurrentScreen} />;
      default: return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-8">
      {/* ⚠️ 这里的 Class 完全是你原始的代码，确保 PC 端是 6xl 的宽屏效果 */}
      <div className="w-full max-w-6xl bg-white md:rounded-[40px] shadow-2xl min-h-screen md:min-h-[85vh] overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;