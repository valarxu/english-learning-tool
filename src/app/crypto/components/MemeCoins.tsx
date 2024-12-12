'use client';

import type { MemeTokenData } from '@/types/crypto';

interface MemeCoinsProps {
  symbols: string[];
  tokenData: Record<string, MemeTokenData>;
}

export default function MemeCoins({ symbols, tokenData }: MemeCoinsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {symbols.map(symbol => {
        const data = tokenData[symbol];
        return (
          <div key={symbol} className="bg-white/90 rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-blue-500">{symbol}</h3>
              {data?.name && <span className="text-sm text-gray-500">{data.name}</span>}
            </div>
            
            {data ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">价格:</span>
                  <span className="font-medium">
                    ${data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">市值:</span>
                  <span className="font-medium">
                    ${data.market_cap.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">24h成交量:</span>
                  <span className="font-medium">
                    ${data.total_volume.toLocaleString()}
                  </span>
                </div>
                {data.holders !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">持有人数:</span>
                    <span className="font-medium">
                      {data.holders.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="text-right text-xs text-gray-400 mt-2">
                  更新于: {new Date(data.last_updated).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 