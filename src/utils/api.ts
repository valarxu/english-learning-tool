import axios from 'axios';
import CryptoJS from 'crypto-js';

export async function fetchOKXToken(tokenAddress: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const requestPath = '/api/v5/wallet/token/token-detail';
  
  // 构建查询字符串
  const params = {
    chainIndex: '501',
    tokenAddress
  };
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  if (isDevelopment) {
    // 本地开发环境直接调用 OKX API
    const signStr = `${timestamp}${method}${requestPath}?${queryString}`;
    const signature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(
        signStr,
        process.env.OKX_SECRET_KEY || ''
      )
    );

    return axios.get(`https://www.okx.com${requestPath}`, {
      params: params,
      headers: {
        'OK-ACCESS-KEY': process.env.NEXT_PUBLIC_OKX_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
        'OK-ACCESS-PROJECT': process.env.NEXT_PUBLIC_OKX_PROJECT_ID,
        'Content-Type': 'application/json'
      }
    });
  } else {
    // 生产环境使用 Next.js API 路由
    return axios.get('/api/okx/token', {
      params: { tokenAddress }
    });
  }
} 