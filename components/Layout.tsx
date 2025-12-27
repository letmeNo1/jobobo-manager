
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen max-w-md mx-auto bg-white shadow-sm flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
