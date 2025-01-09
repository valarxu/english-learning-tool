'use client';

import ReactECharts from 'echarts-for-react';
import { formatPrice } from '@/app/crypto/utils/formatters';
import { getChartOption } from '@/app/crypto/utils/chartConfig';
import type { CryptoData, LoadingState } from '@/types/crypto';

interface MainstreamCoinsProps {
  symbols: string[];
  klineData: CryptoData;
  loadingStates: LoadingState;
  loading: boolean;
  lastUpdate: string;
  onRefresh: () => Promise<void>;
  onOpenModal: () => void;
}

export default function MainstreamCoins({ 
  symbols, 
  klineData, 
  loadingStates,
  loading,
}: MainstreamCoinsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/90 rounded-lg p-4 shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="mt-4 h-[180px] bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {symbols.map(symbol => (
          <div key={symbol} className="bg-white/90 rounded-lg p-2 shadow-lg">
            {loadingStates[symbol] ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                {symbol} 加载中...
              </div>
            ) : klineData[symbol]?.length > 0 ? (
              <>
                <div className="mb-1 flex flex-wrap items-center gap-x-3 px-1">
                  <span className="text-base font-bold text-blue-400">{symbol}</span>
                  <span className="text-sm text-blue-400 whitespace-nowrap">
                    Close: {formatPrice(klineData[symbol][klineData[symbol].length - 1].close)}
                  </span>
                  <span className="text-sm text-red-500 whitespace-nowrap">
                    Min: {formatPrice(Math.min(...klineData[symbol].map(d => d.low)))}
                  </span>
                  <span className="text-sm text-green-500 whitespace-nowrap">
                    Max: {formatPrice(Math.max(...klineData[symbol].map(d => d.high)))}
                  </span>
                </div>
                <ReactECharts 
                  option={getChartOption(symbol, klineData[symbol])} 
                  style={{ height: '220px' }}
                  className="w-full"
                />
              </>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                {symbol} 未获取数据
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
} 