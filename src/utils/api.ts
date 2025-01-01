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

export async function fetchFearGreedIndex() {
  const response = await axios.get('https://api.alternative.me/fng/');
  return {
    value: parseInt(response.data.data[0].value),
    classification: response.data.data[0].value_classification,
    timestamp: new Date().toISOString()
  };
}

export async function fetchMarketDominance() {
  const response = await axios.get('https://api.coingecko.com/api/v3/global');
  return {
    btc: response.data.data.market_cap_percentage.btc,
    stablecoins: response.data.data.market_cap_percentage.usdt +
                 response.data.data.market_cap_percentage.usdc,
    lastUpdate: new Date().toISOString()
  };
}

export async function fetchGlobalMetrics() {
  const response = await axios.get('https://api.coingecko.com/api/v3/global');
  return {
    totalMarketCap: formatNumber(response.data.data.total_market_cap.usd),
    total24hVolume: formatNumber(response.data.data.total_volume.usd),
    lastUpdate: new Date().toISOString()
  };
}

// 获取所有协议的 TVL
export async function fetchProtocolsTVL() {
  const response = await axios.get('https://api.llama.fi/protocols');
  const protocols = response.data
    .filter((protocol: any) => protocol.category !== 'CEX')
    .sort((a: any, b: any) => b.tvl - a.tvl)
    .slice(0, 20)
    .map((protocol: any) => ({
      name: protocol.name,
      tvl: formatNumber(protocol.tvl),
      change1d: protocol.change_1d?.toFixed(2) || '0',
      change7d: protocol.change_7d?.toFixed(2) || '0',
      category: protocol.category
    }));
  
  return {
    protocols,
    lastUpdate: new Date().toISOString()
  };
}

// 获取所有链的 TVL（简化数据）
export async function fetchChainsTVL() {
  const response = await axios.get('https://api.llama.fi/v2/chains');
  const chains = response.data
    .sort((a: any, b: any) => b.tvl - a.tvl)
    .slice(0, 20)
    .map((chain: any) => ({
      name: chain.name,
      tvl: formatNumber(chain.tvl),
      tokenSymbol: chain.tokenSymbol
    }));
  
  return {
    chains,
    lastUpdate: new Date().toISOString()
  };
}

// 获取稳定币流通量
export async function fetchStablecoinsSupply() {
  const response = await axios.get('https://stablecoins.llama.fi/stablecoins?includePrices=true');
  const stablecoins = response.data.peggedAssets
    .sort((a: any, b: any) => b.circulating.peggedUSD - a.circulating.peggedUSD)
    .slice(0, 20)
    .map((coin: any) => {
      const current = coin.circulating.peggedUSD;
      const prevDay = coin.circulatingPrevDay.peggedUSD;
      const prevWeek = coin.circulatingPrevWeek.peggedUSD;
      const prevMonth = coin.circulatingPrevMonth.peggedUSD;

      // 计算变化百分比
      const change1d = ((current - prevDay) / prevDay * 100).toFixed(2);
      const change7d = ((current - prevWeek) / prevWeek * 100).toFixed(2);
      const change30d = ((current - prevMonth) / prevMonth * 100).toFixed(2);

      return {
        name: coin.name,
        symbol: coin.symbol,
        circulating: formatNumber(current),
        change1d,
        change7d,
        change30d
      };
    });

  // 从同一个接口获取链上稳定币数据
  const chainStables = response.data.chains
    .sort((a: any, b: any) => b.totalCirculatingUSD.peggedUSD - a.totalCirculatingUSD.peggedUSD)
    .slice(0, 20)
    .map((chain: any) => ({
      name: chain.name,
      totalCirculating: formatNumber(chain.totalCirculatingUSD.peggedUSD)
    }));

  return {
    stablecoins,
    chainStables,
    lastUpdate: new Date().toISOString()
  };
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

// 获取收益率数据
export async function fetchYields() {
  const response = await axios.get('https://yields.llama.fi/pools');
  const protocols = response.data.data
    .sort((a: any, b: any) => b.tvl - a.tvl)
    .slice(0, 20)
    .map((pool: any) => ({
      name: pool.symbol,
      symbol: pool.chain,
      apy: `${pool.apy.toFixed(2)}%`,
      tvl: formatNumber(pool.tvlUsd),
      project: pool.project
    }));

  return {
    protocols,
    lastUpdate: new Date().toISOString()
  };
}

// 获取交易量数据
export async function fetchVolumes() {
  const response = await axios.get('https://api.llama.fi/overview/dexs');
  const protocols = response.data.protocols
    .sort((a: any, b: any) => b.total24h - a.total24h)
    .slice(0, 20)
    .map((protocol: any) => ({
      name: protocol.name,
      volume24h: formatNumber(protocol.total24h),
      volume7d: formatNumber(protocol.total7d),
      volume30d: formatNumber(protocol.total30d),
      change1d: protocol.change_1d?.toFixed(2) || '0',
      change7d: protocol.change_7d?.toFixed(2) || '0',
      change30d: protocol.change_1m?.toFixed(2) || '0',
      category: protocol.category || '未分类'
    }));

  return {
    protocols,
    lastUpdate: new Date().toISOString()
  };
}

// 获取费用和收入数据
export async function fetchFees() {
  const response = await axios.get('https://api.llama.fi/overview/fees');
  const protocols = response.data.protocols
    .sort((a: any, b: any) => b.total24h - a.total24h)
    .slice(0, 20)
    .map((protocol: any) => ({
      name: protocol.name,
      volume24h: formatNumber(protocol.total24h),
      volume7d: formatNumber(protocol.total7d),
      volume30d: formatNumber(protocol.total30d),
      change1d: protocol.change_1d?.toFixed(2) || '0',
      change7d: protocol.change_7d?.toFixed(2) || '0',
      change30d: protocol.change_1m?.toFixed(2) || '0',
      category: protocol.category || '未分类'
    }));

  return {
    protocols,
    lastUpdate: new Date().toISOString()
  };
} 