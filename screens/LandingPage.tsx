// src/screens/LandingPage.tsx
import React from 'react';
import productImg from '../assets/login.png'; 

const LandingPage: React.FC = () => {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen flex flex-col">
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src={productImg} 
              alt="捷宝宝 Logo" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <h1 className="text-2xl font-bold text-gray-900">捷宝宝 Jabobo</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8 text-gray-600">
              <li>产品</li>
              <li>安全</li>
              <li>故事</li>
              <li>支持</li>
            </ul>
          </nav>
        </header>

        <div className="container mx-auto px-4 flex-grow flex flex-col md:flex-row items-center justify-between py-12">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              用 AI 温暖陪伴
              <br />
              <span className="text-indigo-600">每一个童年</span>
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-lg">
              捷宝宝是专为3-12岁儿童设计的智能陪伴机器人，融合情感计算、语音交互与教育内容，
              在保护隐私的前提下，给孩子一个安全、有趣、有成长的AI伙伴。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">通过国家儿童产品安全认证</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">端到端加密，数据不出设备</span>
              </div>
            </div>
          </div>
          <div className="md:w-2/5 flex justify-center">
            {/* 使用真实产品图 */}
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-3xl shadow-xl border-8 border-white overflow-hidden transform rotate-3">
                <img 
                  src={productImg} 
                  alt="捷宝宝智能机器人" 
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">为什么家长选择捷宝宝？</h2>
            <p className="mt-4 text-gray-600">
              我们专注于儿童发展心理学与AI技术的结合，打造真正懂孩子的智能伙伴。
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🧠",
                title: "情感陪伴",
                desc: "能识别孩子情绪，主动安慰、鼓励，建立安全依恋关系。"
              },
              {
                icon: "📚",
                title: "成长内容",
                desc: "内置分级故事、儿歌、科普知识，内容由教育专家审核。"
              },
              {
                icon: "🔒",
                title: "隐私优先",
                desc: "所有语音数据本地处理，不上传云端，家长完全掌控。"
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900">已陪伴超过 50,000 个家庭</h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            “捷宝宝不仅是玩具，更是孩子的朋友。他学会了分享，也更愿意表达情绪。”  
            —— 北京 李妈妈，8岁男孩家长
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <img 
                src={productImg} 
                alt="捷宝宝" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xl font-bold">捷宝宝 Jabobo</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2026 捷宝宝科技（北京）有限公司. 保留所有权利。
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            本产品仅面向家庭场景，不收集儿童生物特征用于商业用途。
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;