
import React, { useState } from 'react';
import { Screen, Persona } from './types';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Dashboard from './screens/Dashboard';
import Voiceprint from './screens/Voiceprint';
import KnowledgeBase from './screens/KnowledgeBase';

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
      case 'LOGIN':
        return <Login onNavigate={setCurrentScreen} />;
      case 'SIGNUP':
        return <SignUp onNavigate={setCurrentScreen} />;
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
      case 'VOICEPRINT':
        return <Voiceprint onNavigate={setCurrentScreen} />;
      case 'KNOWLEDGE_BASE':
        return <KnowledgeBase onNavigate={setCurrentScreen} />;
      default:
        return <Login onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md bg-white overflow-hidden md:rounded-[40px] shadow-2xl min-h-[100vh] md:min-h-0">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
