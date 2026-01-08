// src/main.tsx （或 index.tsx）
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ 导入的是带 Router 的 App.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App /> {/* 这个 App 包含 Routes 和 LandingPage */}
  </React.StrictMode>
);