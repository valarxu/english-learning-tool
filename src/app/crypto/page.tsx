'use client';

import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function CryptoPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-200/70 via-green-300/60 to-teal-400/70 p-5 relative">
        <Link 
          href="/"
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 
            transition-all duration-300 backdrop-blur-md font-medium
            hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 
            active:scale-95 active:translate-y-0
            flex items-center gap-1 group"
        >
          <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>返回首页</span>
        </Link>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">币圈数据</h1>
          <p className="text-gray-500">功能开发中，敬请期待...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 