import React, { useState, useEffect } from 'react';
import { ArrowLeft, UploadCloud, FileText, Trash2, ShieldAlert, Loader2, Inbox } from 'lucide-react';
import Layout from '../components/Layout';
import { Screen, Document } from '../types';
import { JaboboKnownledgeBase } from '../api/jabobo_knowledge_base';

interface KnowledgeBaseProps {
  jaboboId: string;
  onNavigate: (screen: Screen) => void;
}

// 补充后端返回的文件信息类型（对齐后端结构）
interface BackendFileInfo {
  file_path: string;       // 文件绝对路径
  file_name: string;       // 文件名
  file_size_bytes: number; // 文件大小（字节）
  file_size_mb: number;    // 文件大小（MB）
  upload_time: string;     // 上传时间
  upload_timestamp: number;// 时间戳
  status?: string;         // 文件状态
}

interface ListKBResponse {
  success: boolean;
  total_count: number;
  kb_list: BackendFileInfo[];
  message: string;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ jaboboId, onNavigate }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 辅助函数：格式化字节大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchFileList();
  }, [jaboboId]);

  // 修复：修正后端返回字段解析 + 字段映射
  const fetchFileList = async () => {
    if (!jaboboId) return;
    setIsLoading(true);
    try {
      // 1. 调用列表接口（确保JaboboConfig.listKnowledgeBase正确传参）
      const res = await JaboboKnownledgeBase.listKnowledgeBase(jaboboId);
      console.log('后端列表接口返回:', res); // 调试用：查看真实返回数据

      // 2. 修正：读取后端实际返回的kb_list字段（而非files）
      if (res.success && res.kb_list && Array.isArray(res.kb_list)) {
        // 3. 修正：字段映射（对齐后端返回的字段名）
        const mappedDocs: Document[] = res.kb_list.map((file: BackendFileInfo) => ({
          id: file.file_path, // 用绝对路径作为唯一ID（避免文件名重复）
          name: file.file_name, // 后端返回的是file_name，不是name
          size: formatFileSize(file.file_size_bytes), // 用字节数格式化，不是直接用file.size
          date: file.upload_time || '未知时间', // 后端返回的是upload_time
          filePath: file.file_path // 新增：存储绝对路径，用于删除
        }));
        setDocs(mappedDocs);
        console.log('映射后的文件列表:', mappedDocs); // 调试用
      } else {
        setDocs([]); // 无数据时清空
      }
    } catch (err) {
      console.error("获取列表失败:", err);
      setDocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const file = files[0];

    // 校验文件格式
    const allowedExtensions = ['.pdf', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      alert("❌ 只允许上传 PDF 或 TXT 文件");
      return;
    }

    // 校验文件大小（30MB）
    if (file.size > 30 * 1024 * 1024) {
      alert("❌ 文件大小不能超过30MB");
      return;
    }

    setIsUploading(true);
    try {
      const res = await JaboboKnownledgeBase.uploadKnowledgeBase(jaboboId, file);
      if (res.success) {
        alert("✨ 知识库同步成功！");
        await fetchFileList(); // 重新加载列表
      } else {
        alert("上传失败: " + (res.message || "未知错误"));
      }
    } catch (err: any) {
      alert("网络错误: " + (err.message || "上传失败"));
    } finally {
      setIsUploading(false);
      e.target.value = ""; // 重置文件选择框
    }
  };

  // 修复：删除时传递文件绝对路径（而非仅文件名）
  const handleDelete = async (filePath: string, fileName: string) => {
    if (!window.confirm(`确定要删除 ${fileName} 吗？`)) return;
    try {
      // 调用删除接口时，传递filePath（绝对路径）
      const res = await JaboboKnownledgeBase.deleteKnowledgeBase(jaboboId, filePath);
      if (res.success) {
        alert("✅ 文件删除成功！");
        await fetchFileList(); // 重新加载列表
      } else {
        alert("删除失败: " + (res.message || "未知错误"));
      }
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败，请重试");
    }
  };

  return (
    <Layout className="bg-white">
      <div className="p-6">
        <button 
          onClick={() => onNavigate('DASHBOARD')} 
          className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600 active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-6">Knowledge Base</h1>

        {/* Upload Area */}
        <label className={`mb-8 block cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input 
            type="file" 
            className="hidden" 
            accept=".txt,.pdf" 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
          <div className="w-full border-2 border-dashed border-gray-200 rounded-[24px] p-10 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-yellow-500 mb-4">
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{isUploading ? 'Uploading...' : 'Upload Knowledge File'}</h3>
            <p className="text-xs text-gray-400">PDF or TXT, up to 30MB</p>
          </div>
        </label>

        {/* List Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Device Documents</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{docs.length} files</span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
          ) : docs.length > 0 ? (
            docs.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 mr-4">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{doc.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{doc.size} • {doc.date}</p>
                </div>
                {/* 修复：传递filePath和fileName给删除函数 */}
                <button 
                  onClick={() => handleDelete(doc.filePath, doc.name)} 
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-300 border-2 border-dotted border-gray-100 rounded-3xl">
              <Inbox size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No files uploaded</p>
            </div>
          )}
        </div>

        {/* DB Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-start space-x-3">
          <ShieldAlert size={18} className="text-blue-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-blue-800 mb-1">Storage Sync</h4>
            <p className="text-[10px] text-blue-600 leading-relaxed font-mono">
              Metadata stored in <code>kb_status</code> (JSON TEXT)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgeBase;