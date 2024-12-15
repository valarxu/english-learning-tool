'use client';

import type { MemeToken, MemeTokenData } from '@/types/crypto';

interface MemeCoinsProps {
  tokens: MemeToken[];
  tokenData: Record<string, MemeTokenData>;
}

export default function MemeCoins({ tokens, tokenData }: MemeCoinsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tokens.map(token => {
        const data = tokenData[token.symbol];
        return (
          <div key={token.contract_address} className="bg-white/90 rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-blue-500">{token.symbol}</h3>
              <span className="text-sm text-gray-500">{token.name}</span>
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