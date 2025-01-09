'use client';

import Image from 'next/image';
import type { MemeToken } from '@/types/crypto';

interface MemeCoinsProps {
  tokens: MemeToken[];
  onCopyAddress: (address: string) => void;
  isLoading?: boolean;
}

export default function MemeCoins({ tokens, onCopyAddress, isLoading = false }: MemeCoinsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/90 rounded-lg p-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatNumber = (value: string | number | undefined) => {
    if (!value) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
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
  };

  // 计算成交量/市值比率
  const calculateVolumeRatio = (volume?: string, marketCap?: string) => {
    if (!volume || !marketCap) return 0;
    const v = parseFloat(volume);
    const m = parseFloat(marketCap);
    if (m === 0) return 0;
    return (v / m) * 100;
  };

  // 按市值排序的代币列表
  const sortedTokens = [...tokens].sort((a, b) => {
    const marketCapA = a.marketCap ? parseFloat(a.marketCap) : 0;
    const marketCapB = b.marketCap ? parseFloat(b.marketCap) : 0;
    return marketCapB - marketCapA;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {sortedTokens.map(token => (
        <div key={token.contract_address} className="bg-white/90 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-2 mb-3">
            {token.logoUrl && (
              <Image
                src={token.logoUrl}
                alt={`${token.name} logo`}
                width={32}
                height={32}
                className="rounded-full shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="text-lg font-bold text-blue-500 truncate">{token.name}</h3>
                <button
                  onClick={() => onCopyAddress(token.contract_address)}
                  className="shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="复制合约地址"
                >
                  <svg 
                    className="w-4 h-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
              <span className="text-sm text-gray-500">{token.symbol}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">市值:</span>
              <span className="font-medium">
                ${formatNumber(token.marketCap)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">24h成交量:</span>
              <span className="font-medium">
                ${formatNumber(token.volume24h)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">成交量/市值:</span>
              <span className="font-medium text-blue-500">
                {calculateVolumeRatio(token.volume24h, token.marketCap).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 