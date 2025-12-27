
export type Screen = 'LOGIN' | 'SIGNUP' | 'DASHBOARD' | 'VOICEPRINT' | 'KNOWLEDGE_BASE';

export interface Persona {
  id: string;
  name: string;
  content: string;
}

export interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  duration: string;
  date: string;
}
