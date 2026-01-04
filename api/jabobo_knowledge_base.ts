// api/jabobo_congfig.ts 中的listKnowledgeBase方法示例（确保传参和返回解析正确）
export const JaboboKnownledgeBase = {
    // 查询知识库列表
    listKnowledgeBase: async (jaboboId: string) => {
      const username = localStorage.getItem('username'); // 从本地存储获取当前用户
      const token = localStorage.getItem('session_token'); // 获取身份验证token
      
      const response = await fetch(`/api/user/list-kb?jabobo_id=${jaboboId}`, {
        method: 'GET',
        headers: {
          'x_username': username || '',
          'authorization': token || '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    },
  
    // 删除知识库文件（修复：传递filePath参数）
    deleteKnowledgeBase: async (jaboboId: string, filePath: string) => {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('session_token');
      
      // 注意：filePath需要编码，避免特殊字符（如冒号、斜杠）导致URL错误
      const encodedFilePath = encodeURIComponent(filePath);
      const response = await fetch(`/api/user/delete-kb?jabobo_id=${jaboboId}&file_path=${encodedFilePath}`, {
        method: 'DELETE',
        headers: {
          'x_username': username || '',
          'authorization': token || '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    },
  
    // 上传接口保持不变（确保传参正确）
    uploadKnowledgeBase: async (jaboboId: string, file: File) => {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('session_token');
      
      const formData = new FormData();
      formData.append('jabobo_id', jaboboId);
      formData.append('file', file);
      
      const response = await fetch('/api/user/upload-kb', {
        method: 'POST',
        headers: {
          'x_username': username || '',
          'authorization': token || ''
          // 注意：上传文件时不要设置Content-Type，浏览器会自动设置multipart/form-data
        },
        body: formData
      });
      
      const data = await response.json();
      return data;
    }
  };