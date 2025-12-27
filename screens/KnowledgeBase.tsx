
import React, { useState } from 'react';
import { ArrowLeft, UploadCloud, FileText, Trash2, ShieldAlert } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, Document } from '../types';

interface KnowledgeBaseProps {
  onNavigate: (screen: Screen) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onNavigate }) => {
  const [docs, setDocs] = useState<Document[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        date: new Date().toLocaleDateString()
      };
      setDocs([...docs, newDoc]);
    }
  };

  return (
    <Layout className="bg-white">
      <div className="p-6">
        <button onClick={() => onNavigate('DASHBOARD')} className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-6">Knowledge Base</h1>

        {/* Upload Area */}
        <label className="mb-8 block cursor-pointer">
          <input type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} />
          <div className="w-full border-2 border-dashed border-gray-200 rounded-[24px] p-10 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-yellow-500 mb-4">
              <UploadCloud size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Upload Text File</h3>
            <p className="text-xs text-gray-400">Tap to browse or drag .txt files here</p>
          </div>
        </label>

        {/* List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Uploaded Documents</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{docs.length} files</span>
        </div>

        <div className="space-y-3">
          {docs.length > 0 ? (
            docs.map(doc => (
              <div key={doc.id} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 mr-4">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{doc.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{doc.size} • {doc.date}</p>
                </div>
                <button 
                  onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <FileText size={32} />
              </div>
              <p className="text-sm font-medium">No knowledge files yet.</p>
            </div>
          )}
        </div>

        {/* Demo Alert Logic shown in video */}
        <button 
          onClick={() => alert("This feature is locked in the demo.")}
          className="mt-8 w-full flex items-center justify-center p-4 text-yellow-600 bg-yellow-50 rounded-xl text-xs font-bold space-x-2"
        >
          <ShieldAlert size={14} />
          <span>Advanced file indexing is coming soon</span>
        </button>
      </div>
    </Layout>
  );
};

export default KnowledgeBase;
