export interface KLineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CryptoData {
  [symbol: string]: KLineData[];
}

export interface LoadingState {
  [symbol: string]: boolean;
}

export interface MemeTokenData {
  id: string;
  symbol: string;
  name: string;
  market_cap: number;
  current_price: number;
  total_volume: number;
  holders?: number;  // CoinGecko 可能不提供这个数据
  last_updated: string;
}

export type MemeTokensData = Record<string, MemeTokenData>;

export interface MemeToken {
  id?: string;
  name: string;
  symbol: string;
  contract_address: string;
  user_id?: string;
  created_at?: string;
  logoUrl?: string;
  volume24h?: string;
  marketCap?: string;
}

export interface MarketMetrics {
  fearGreedIndex?: {
    value: number;
    classification: string;
    timestamp: string;
  };
  etfFlows?: {
    btc: {
      netFlow: string;
      totalHoldings: string;
    };
    eth: {
      netFlow: string;
      totalHoldings: string;
    };
    lastUpdate: string;
  };
  marketDominance?: {
    btc: number;
    stablecoins: number;
    lastUpdate: string;
  };
  liquidations?: {
    total24h: string;
    largest: {
      amount: string;
      symbol: string;
      type: 'long' | 'short';
    };
    lastUpdate: string;
  };
  globalMetrics?: {
    totalMarketCap: string;
    total24hVolume: string;
    lastUpdate: string;
  };
  defiProtocols?: {
    protocols: Array<{
      name: string;
      tvl: string;
      change1d: string;
      change7d: string;
      category: string;
    }>;
    lastUpdate: string;
  };
  defiChains?: {
    chains: Array<{
      name: string;
      tvl: string;
      tokenSymbol: string;
    }>;
    lastUpdate: string;
  };
  stablecoins?: Array<{
    name: string;
    symbol: string;
    circulating: string;
    price: string;
    change1d: string;
    change7d: string;
    change30d: string;
  }>;
  chainStables?: Array<{
    name: string;
    totalCirculating: string;
  }>;
  yields?: {
    protocols: Array<{
      name: string;
      symbol: string;
      apy: string;
      tvl: string;
      project: string;
    }>;
    lastUpdate: string;
  };
  volumes?: {
    protocols: Array<{
      name: string;
      volume24h: string;
      volume7d: string;
      volume30d: string;
      change1d: string;
      change7d: string;
      change30d: string;
      category: string;
    }>;
    lastUpdate: string;
  };
  fees?: {
    protocols: Array<{
      name: string;
      volume24h: string;
      volume7d: string;
      volume30d: string;
      change1d: string;
      change7d: string;
      change30d: string;
      category: string;
    }>;
    lastUpdate: string;
  };
} 