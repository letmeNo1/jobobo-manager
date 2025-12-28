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
import { JaboboConfig } from './api/jabobo_congfig'; // 👈 导入 API

const INITIAL_PERSONAS: Persona[] = [
  { id: 'default', name: 'My AI', content: '' }
];

const App: React.FC = () => {
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

  useEffect(() => {
    if (selectedUuid) localStorage.setItem('active_jabobo_uuid', selectedUuid);
  }, [selectedUuid]);

  // --- 逻辑操作函数 ---

  const handleUpdatePersona = (id: string, content: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, content } : p));
  };

  const handleAddPersona = () => {
    const newId = Date.now().toString();
    setPersonas(prev => [...prev, { id: newId, name: `Persona ${prev.length + 1}`, content: '' }]);
    setActivePersonaId(newId);
  };

  // 🗑️ 删除人设并立即同步后端
  const handleDeletePersona = async (id: string) => {
    if (!selectedUuid) return;

    // 1. 计算删除后的人设列表
    const updatedPersonas = personas.filter(p => p.id !== id);
    
    // 2. 如果删除的是当前激活的，切换焦点
    let nextActiveId = activePersonaId;
    if (activePersonaId === id && updatedPersonas.length > 0) {
      nextActiveId = updatedPersonas[0].id;
    }

    try {
      // 3. 调用后端接口同步
      const res = await JaboboConfig.syncConfig(selectedUuid, {
        persona: JSON.stringify(updatedPersonas), // 全量覆盖
        memory: memory,
        voice_status: "已就绪", // 这里可以根据实际情况传值或从状态中取
        kb_status: "已同步"
      });

      if (res.success) {
        // 4. 后端成功后同步前端状态
        setPersonas(updatedPersonas);
        setActivePersonaId(nextActiveId);
        console.log("✨ Persona deleted and synced to cloud");
      } else {
        alert("删除失败: " + (res.message || "服务器错误"));
      }
    } catch (err) {
      console.error("Sync failed during deletion", err);
      alert("网络错误，人设删除同步失败");
    }
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
            jaboboId={selectedUuid || ''}
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
            onDeletePersona={handleDeletePersona} // 👈 绑定
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
      <div className="w-full max-w-6xl bg-white md:rounded-[40px] shadow-2xl min-h-screen md:min-h-[85vh] overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;