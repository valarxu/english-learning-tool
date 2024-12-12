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