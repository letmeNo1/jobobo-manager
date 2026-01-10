// src/components/Common/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
// 导入你的 useAuth 钩子（注意路径要和你的项目一致）
import { useAuth } from '../hooks/useAuth';

// 支持的语言列表（统一维护）
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
];

// 组件属性定义
interface LanguageSwitcherProps {
  className?: string;
  forceVisible?: boolean; // 强制显示/隐藏（优先级高于登录状态）
  onLanguageChange?: () => void; // 新增：语言切换回调
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '',
  forceVisible // 注意：这里移除默认值，改为自动判断（关键修正）
}) => {
  const { i18n, t } = useTranslation();
  const { isLoggedIn } = useAuth(); // 获取登录状态

  // 切换语言的核心函数
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // 显隐逻辑（核心）：
  // 1. 如果传了 forceVisible，按该值控制
  // 2. 没传则自动判断：未登录 → 显示，已登录 → 隐藏
  const isVisible = forceVisible !== undefined 
    ? forceVisible 
    : !isLoggedIn;

  // 不需要显示则返回空
  if (!isVisible) return null;

  return (
    <div className={`flex space-x-2 ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button" // 明确按钮类型，避免表单默认行为
          onClick={() => changeLanguage(lang.code)}
          // 按钮样式（和你登录页/落地页保持一致的黄色主题）
          className={`px-3 py-1 rounded font-medium text-sm
            ${i18n.language === lang.code 
              ? 'bg-yellow-400 text-gray-900' 
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
            transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-300`}
          aria-label={`Switch to ${lang.label}`} // 无障碍属性
        >
          {t(`language.${lang.code}`)}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;