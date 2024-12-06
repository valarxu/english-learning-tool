'use client';

import Link from 'next/link';

export default function CryptoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-300/80 via-green-400/70 to-teal-500/80 p-5 relative">
      <Link 
        href="/"
        className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 hover:bg-white transition-all duration-300 backdrop-blur-md font-medium"
      >
        ← 返回首页
      </Link>

      <div className="text-center pt-20">
        <h1 className="text-2xl font-bold text-gray-800">币圈数据</h1>
        <p className="text-gray-600 mt-4">功能开发中...</p>
      </div>
    </div>
  );
} 