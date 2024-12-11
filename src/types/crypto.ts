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