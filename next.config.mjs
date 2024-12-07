/** @type {import('next').NextConfig} */
const nextConfig = {
  // 添加环境变量到运行时配置
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // 禁用静态导出
  output: 'standalone',
};

export default nextConfig; 