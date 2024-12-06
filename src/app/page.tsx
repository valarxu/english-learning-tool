'use client';

import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { logout } = useAuth();
  
  const modules = [
    {
      title: "单词本",
      description: "按场景分类整理单词，帮助记忆和学习",
      icon: "📚",
      href: "/vocabulary"
    },
    {
      title: "金融计算器",
      description: "各类金融计算工具，支持利率、投资收益等计算",
      icon: "🧮",
      href: "/calculator"
    },
    {
      title: "币圈数据",
      description: "实时加密货币行情、市场分析和趋势追踪",
      icon: "📊",
      href: "/crypto"
    },
    {
      title: "待办事项",
      description: "任务管理和日程规划，提高工作效率",
      icon: "✓",
      href: "/todos"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-300/80 via-green-400/70 to-teal-500/80 p-5">
        {/* 添加登出按钮 */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 hover:bg-white transition-all duration-300 backdrop-blur-md font-medium"
        >
          登出
        </button>
        
        <div className="max-w-6xl mx-auto">
          {/* 欢迎区域 */}
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              个人工具集
            </h1>
            <p className="text-gray-600 text-lg">
              提供多种实用工具，提升学习和工作效率
            </p>
          </div>

          {/* 功能模块网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-4">
            {modules.map((module, index) => (
              <Link 
                key={index} 
                href={module.href}
                className="bg-white/90 rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white border border-gray-200 group hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl bg-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center shrink-0">
                    {module.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-2 group-hover:text-gray-900">
                      {module.title}
                    </h2>
                    <p className="text-gray-600 group-hover:text-gray-700">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 底部信息 */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Version 1.0.0 | Made with ❤️
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
