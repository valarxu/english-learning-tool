import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get('tokenAddress');
    
    if (!tokenAddress) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
    }

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
    
    // 构建签名字符串
    const signStr = `${timestamp}${method}${requestPath}?${queryString}`;
    
    // 在服务器端生成签名
    const signature = CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA256(
        signStr,
        process.env.OKX_SECRET_KEY || ''
      )
    );

    const response = await fetch(
      `https://www.okx.com${requestPath}?${queryString}`,
      {
        headers: {
          'OK-ACCESS-KEY': process.env.NEXT_PUBLIC_OKX_API_KEY!,
          'OK-ACCESS-SIGN': signature,
          'OK-ACCESS-TIMESTAMP': timestamp,
          'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE!,
          'OK-ACCESS-PROJECT': process.env.NEXT_PUBLIC_OKX_PROJECT_ID!,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OKX API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token info' },
      { status: 500 }
    );
  }
} 