/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_OKX_API_KEY: process.env.NEXT_PUBLIC_OKX_API_KEY,
    NEXT_PUBLIC_OKX_PROJECT_ID: process.env.NEXT_PUBLIC_OKX_PROJECT_ID,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.oklink.com',
        port: '',
        pathname: '/cdn/**',
      },
    ],
  },
};

export default nextConfig; 