import { supabase } from '../config/supabase';
import { hashPassword, comparePasswords } from '../utils/crypto';

export async function registerUser(username: string, password: string) {
  // 检查用户名是否已存在
  const { data: existingUser } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .single();

  if (existingUser) {
    throw new Error('用户名已存在');
  }

  // 加密密码
  const hashedPassword = await hashPassword(password);

  // 创建新用户
  const { error } = await supabase
    .from('users')
    .insert([{
      id: username,
      username,
      password: hashedPassword,
    }]);

  if (error) {
    console.error('Registration error:', error);
    throw new Error('注册失败');
  }
}

export async function authenticateUser(username: string, password: string) {
  // 获取用户信息
  const { data: user, error } = await supabase
    .from('users')
    .select()
    .eq('username', username)
    .single();

  if (error || !user) {
    throw new Error('用户不存在');
  }

  // 验证密码
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new Error('密码错误');
  }

  return user;
} 