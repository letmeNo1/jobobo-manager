
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, ...props }) => {
  return (
    <div className="w-full mb-4">
      {label && <label className="block text-gray-500 text-sm mb-1">{label}</label>}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${icon ? 'pl-11' : 'px-4'} pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all`}
        />
      </div>
    </div>
  );
};

export default Input;
