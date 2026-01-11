import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 80,
        host: '0.0.0.0',
        // 核心新增：添加允许访问的主机列表
        allowedHosts: [
          'www.nanputuo.top', // 解决报错的关键配置
          '0.0.0.0',         // 保留原有 host 配置对应的地址
          'localhost',       // 允许本地访问
          '127.0.0.1'        // 允许本地 IP 访问
        ]
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});