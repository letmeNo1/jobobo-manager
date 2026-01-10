import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  Loader2, 
  Inbox 
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 引入i18n钩子
import Layout from '../components/Layout';
import { Screen, Document, BackendFileInfo } from '../types';
import { JaboboKnownledgeBase } from '../api/jabobo_knowledge_base';

interface KnowledgeBaseProps {
  jaboboId: string;
  onNavigate: (screen: Screen) => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ jaboboId, onNavigate }) => {
  // 获取i18n翻译函数
  const { t } = useTranslation();
  
  // 状态管理
  const [docs, setDocs] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 常量定义：统一管理限制规则
  const MAX_FILE_COUNT = 10; // 最大文件数
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 单文件最大5MB
  const MAX_TEXT_LENGTH = 100000; // 文本内容最大10万字节
  const ALLOWED_FILE_TYPE = '.txt'; // 仅允许TXT

  // 辅助函数：格式化字节大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return t('knowledgeBase.fileSize.0B');
    const k = 1024;
    const sizes = [t('knowledgeBase.fileSize.B'), t('knowledgeBase.fileSize.KB'), t('knowledgeBase.fileSize.MB'), t('knowledgeBase.fileSize.GB')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 加载文件列表
  useEffect(() => {
    fetchFileList();
  }, [jaboboId, t]); // 添加t到依赖，确保语言切换时重新渲染

  // 获取文件列表
  const fetchFileList = async (): Promise<void> => {
    if (!jaboboId) return;
    
    setIsLoading(true);
    try {
      const res = await JaboboKnownledgeBase.listKnowledgeBase(jaboboId);
      console.log(t('knowledgeBase.log.backendListResponse'), res);

      if (res.success && res.kb_list && Array.isArray(res.kb_list)) {
        const mappedDocs: Document[] = res.kb_list.map((file: BackendFileInfo) => ({
          id: file.file_path,
          name: file.file_name,
          size: formatFileSize(file.file_size_bytes),
          date: file.upload_time || t('knowledgeBase.unknownTime'),
          filePath: file.file_path
        }));
        setDocs(mappedDocs);
      } else {
        setDocs([]);
        if (res.message) {
          console.warn(t('knowledgeBase.log.backendTip'), res.message);
        }
      }
    } catch (err: any) {
      console.error(t('knowledgeBase.log.fetchListFailed'), err);
      alert(`${t('knowledgeBase.error.loadListFailed')}: ${err.message || t('knowledgeBase.error.networkError')}`);
      setDocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 辅助函数：读取TXT文件内容并校验长度
  const validateTextContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      // 读取文件内容
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          // 校验字节长度（使用TextEncoder计算UTF-8字节数，更准确）
          const byteLength = new TextEncoder().encode(content).length;
          
          if (byteLength > MAX_TEXT_LENGTH) {
            alert(`${t('knowledgeBase.error.contentExceedLimit')}（${t('knowledgeBase.current')}：${byteLength}${t('knowledgeBase.bytes')}）`);
            resolve(false);
          } else {
            resolve(true);
          }
        } catch (err) {
          alert(t('knowledgeBase.error.readContentFailed'));
          resolve(false);
        }
      };
      
      // 读取失败处理
      reader.onerror = () => {
        alert(t('knowledgeBase.error.invalidTextFile'));
        resolve(false);
      };
      
      // 以文本方式读取文件
      reader.readAsText(file, 'utf-8');
    });
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    
    const file = files[0];

    // 1. 检查列表是否加载完成
    if (isLoading) {
      alert(t('knowledgeBase.error.listLoading'));
      return;
    }

    // 2. 限制文件总数不超过10个
    if (docs.length >= MAX_FILE_COUNT) {
      alert(t('knowledgeBase.error.exceedFileCount', { max: MAX_FILE_COUNT }));
      return;
    }

    // 3. 校验文件格式（仅TXT）
    const fileName = file.name.trim();
    const extIndex = fileName.lastIndexOf('.');
    let fileExt = '';
    
    if (extIndex > 0) {
      fileExt = fileName.slice(extIndex).toLowerCase();
    }
    
    if (fileExt !== ALLOWED_FILE_TYPE) {
      alert(t('knowledgeBase.error.invalidFileType', { type: ALLOWED_FILE_TYPE.toUpperCase() }));
      return;
    }

    // 4. 校验文件大小（5MB）
    if (file.size > MAX_FILE_SIZE) {
      alert(t('knowledgeBase.error.exceedFileSize', { size: formatFileSize(MAX_FILE_SIZE) }));
      return;
    }

    // 5. 新增：校验文本内容字节数（不超过10万）
    const isContentValid = await validateTextContent(file);
    if (!isContentValid) {
      e.target.value = ""; // 重置文件选择框
      return;
    }

    setIsUploading(true);
    try {
      const res = await JaboboKnownledgeBase.uploadKnowledgeBase(jaboboId, file);
      
      if (res.success) {
        alert(t('knowledgeBase.success.upload'));
        await fetchFileList(); // 重新加载列表
      } else {
        alert(`${t('knowledgeBase.error.uploadFailed')}: ${res.message || res.detail || t('knowledgeBase.error.unknownError')}`);
      }
    } catch (err: any) {
      console.error(t('knowledgeBase.log.uploadFailedDetail'), err);
      alert(`${t('knowledgeBase.error.networkError')}: ${err.message || t('knowledgeBase.error.uploadCheckBackend')}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // 重置文件选择框
    }
  };

  // 处理文件删除
  const handleDelete = async (filePath: string, fileName: string): Promise<void> => {
    if (!window.confirm(t('knowledgeBase.confirm.deleteFile', { name: fileName }))) return;
    
    try {
      const res = await JaboboKnownledgeBase.deleteKnowledgeBase(jaboboId, filePath);
      
      if (res.success) {
        alert(t('knowledgeBase.success.delete'));
        await fetchFileList(); // 重新加载列表
      } else {
        alert(`${t('knowledgeBase.error.deleteFailed')}: ${res.message || res.detail || t('knowledgeBase.error.unknownError')}`);
      }
    } catch (err) {
      console.error(t('knowledgeBase.log.deleteFailed'), err);
      alert(`${t('knowledgeBase.error.deleteFailed')}: ${(err as Error).message}`);
    }
  };

  // 组件渲染
  return (
    <Layout className="bg-white">
      <div className="p-6">
        {/* 返回按钮 */}
        <button 
          onClick={() => onNavigate('DASHBOARD')} 
          className="mb-6 p-2 bg-gray-50 rounded-full text-gray-600 active:scale-95 transition-transform"
          aria-label={t('knowledgeBase.button.backToDashboard')}
        >
          <ArrowLeft size={20} />
        </button>

        {/* 标题 */}
        <h1 className="text-xl font-bold text-gray-800 mb-6">{t('knowledgeBase.title.main')}</h1>

        {/* 上传区域 */}
        <label className={`mb-8 block cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input 
            type="file" 
            className="hidden" 
            accept={ALLOWED_FILE_TYPE} 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
          <div className="w-full border-2 border-dashed border-gray-200 rounded-[24px] p-10 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-yellow-500 mb-4">
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            </div>
            <h3 className="font-bold text-gray-800 mb-1">
              {isUploading ? t('knowledgeBase.status.uploading') : t('knowledgeBase.button.uploadFile')}
            </h3>
            {/* 新增：提示文本内容限制 */}
            <p className="text-xs text-gray-400">
              {t('knowledgeBase.uploadHint', { 
                type: ALLOWED_FILE_TYPE.toUpperCase(), 
                size: formatFileSize(MAX_FILE_SIZE),
                maxFiles: MAX_FILE_COUNT,
                maxBytes: MAX_TEXT_LENGTH 
              })}
            </p>
          </div>
        </label>

        {/* 文件列表标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">{t('knowledgeBase.title.deviceDocuments')}</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {t('knowledgeBase.fileCount', { current: docs.length, max: MAX_FILE_COUNT })}
          </span>
        </div>

        {/* 文件列表 */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : docs.length > 0 ? (
            docs.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 mr-4">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{doc.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {doc.size} • {doc.date}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(doc.filePath, doc.name)} 
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  aria-label={t('knowledgeBase.button.deleteFile', { name: doc.name })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-300 border-2 border-dotted border-gray-100 rounded-3xl">
              <Inbox size={32} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">{t('knowledgeBase.emptyState.noFiles')}</p>
            </div>
          )}
        </div>

        {/* 存储信息提示 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-start space-x-3">
          <ShieldAlert size={18} className="text-blue-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-blue-800 mb-1">{t('knowledgeBase.tip.storageSync')}</h4>
            <p className="text-[10px] text-blue-600 leading-relaxed font-mono">
              {t('knowledgeBase.tip.metadataStorage')}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KnowledgeBase;