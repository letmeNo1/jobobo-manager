import React, { useState } from 'react';
import { Screen, Persona } from './types';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Dashboard from './screens/Dashboard';
import Voiceprint from './screens/Voiceprint';
import KnowledgeBase from './screens/KnowledgeBase';
import AdminUserManagement from './screens/AdminUserManagement.tsx';

const INITIAL_PERSONAS: Persona[] = [
  { id: '1', name: 'Standard', content: 'You are a helpful and polite AI assistant.' },
  { id: '2', name: 'Jazz Fan', content: 'You are a cool jazz enthusiast who uses musical metaphors.' },
];

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [activePersonaId, setActivePersonaId] = useState<string>(INITIAL_PERSONAS[0].id);
  const [memory, setMemory] = useState('');

  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  const handleAddPersona = () => {
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: `New Persona ${personas.length + 1}`,
      content: ''
    };
    setPersonas([...personas, newPersona]);
    setActivePersonaId(newPersona.id);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': return <Login onNavigate={setCurrentScreen} />;
      case 'SIGNUP': return <SignUp onNavigate={setCurrentScreen} />;
      case 'ADMIN': return <AdminUserManagement onNavigate={setCurrentScreen} />;
      case 'DASHBOARD':
        return (
          <Dashboard 
            onNavigate={setCurrentScreen} 
            personas={personas}
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
      default: return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    // 修改点：移除 max-w-md，增加 md 响应式断点控制
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-8">
      <div className="w-full max-w-full md:max-w-6xl bg-white overflow-hidden md:rounded-[40px] shadow-2xl min-h-screen md:min-h-[85vh] transition-all">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;