import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = "" }) => {
  return (
    // 修改点：移除 max-w-md，让宽度由 App 容器控制
    <div className={`w-full mx-auto bg-white flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default Layout;