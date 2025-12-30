import React, { useEffect, useState } from 'react';
import { Screen, Persona } from './types';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Dashboard from './screens/Dashboard';
import Voiceprint from './screens/Voiceprint';
import KnowledgeBase from './screens/KnowledgeBase';
import AdminUserManagement from './screens/AdminUserManagement';
import Settings from './screens/Settings'; 
import JaboboSelector from './screens/JaboboSelector';

const INITIAL_PERSONAS: Persona[] = [{ id: 'default', name: 'My AI', content: '' }];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    const savedUser = localStorage.getItem('user');
    const savedUuid = localStorage.getItem('active_jabobo_uuid');
    if (!savedUser) return 'LOGIN';
    return savedUuid ? 'DASHBOARD' : 'SELECT_JABOBO';
  });

  const [selectedUuid, setSelectedUuid] = useState<string | null>(localStorage.getItem('active_jabobo_uuid'));
  
  // 💡 重要：当切换设备时，这些状态应该被 Dashboard 的 fetch 覆盖，不要共用
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>('');
  const [memory, setMemory] = useState('');

  useEffect(() => {
    if (selectedUuid) {
      localStorage.setItem('active_jabobo_uuid', selectedUuid);
    }
  }, [selectedUuid]);

  // 纯前端更新内容
  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  const handleAddPersona = () => {
    const newId = Date.now().toString();
    setPersonas(prev => [...prev, { id: newId, name: `Persona ${prev.length + 1}`, content: '' }]);
    setActivePersonaId(newId);
  };

  const handleDeletePersona = (id: string) => {
    const updated = personas.filter(p => p.id !== id);
    setPersonas(updated);
    if (activePersonaId === id && updated.length > 0) {
      setActivePersonaId(updated[0].id);
    }
  };

  const renderScreen = () => {
    // 提取公共 ID 以便复用
    const currentId = selectedUuid || '';

    switch (currentScreen) {
      case 'SELECT_JABOBO': 
        return <JaboboSelector 
          onSelect={(uuid) => { 
            // 切换设备时，先清空当前人设状态，防止旧设备的顺序闪现
            setPersonas(INITIAL_PERSONAS);
            setActivePersonaId('');
            setSelectedUuid(uuid); 
            setCurrentScreen('DASHBOARD'); 
          }} 
          onNavigate={setCurrentScreen} 
        />;
      
      case 'DASHBOARD':
        return (
          <Dashboard 
            jaboboId={currentId}
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
            onDeletePersona={handleDeletePersona}
            memory={memory}
            setMemory={setMemory}
          />
        );

      case 'KNOWLEDGE_BASE': 
        return (
          <KnowledgeBase 
            jaboboId={currentId} // ✨ 修复：传递选中的设备 ID
            onNavigate={setCurrentScreen} 
          />
        );

      case 'VOICEPRINT': 
        return (
          <Voiceprint 
            jaboboId={currentId} // ✨ 修复：传递选中的设备 ID
            onNavigate={setCurrentScreen} 
          />
        );

      case 'LOGIN': return <Login onNavigate={setCurrentScreen} />;
      case 'SIGNUP': return <SignUp onNavigate={setCurrentScreen} />;
      case 'ADMIN': return <AdminUserManagement onNavigate={setCurrentScreen} />;
      case 'SETTINGS': return <Settings onNavigate={setCurrentScreen} />;
      default: return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white shadow-2xl min-h-screen overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;