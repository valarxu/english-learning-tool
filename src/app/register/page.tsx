'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '../../services/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      await registerUser(username, password);
      router.push('/login?registered=true');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-gradient-bg flex items-center justify-center">
      <div className="bg-white/90 rounded-xl p-8 shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">注册账号</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 disabled:opacity-50"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>

          <div className="text-center text-gray-600">
            已有账号？
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 ml-1">
              去登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 