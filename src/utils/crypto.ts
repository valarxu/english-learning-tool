// 使用简单的 SHA-256 加密
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 比较密码
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(plainPassword);
  return hashedInput === hashedPassword;
} 