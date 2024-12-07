import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // 只在客户端显示错误
  if (typeof window !== 'undefined') {
    console.error('Missing Supabase environment variables');
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://your-project.supabase.co',
  supabaseKey || 'your-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
); 