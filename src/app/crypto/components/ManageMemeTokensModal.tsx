'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { MemeToken } from '@/types/crypto';
import axios from 'axios';

interface TokenInfo {
  name: string;
  symbol: string;
  contract_address: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  volume24h?: string;
  marketCap?: string;
}

interface ManageMemeTokensModalProps {
  tokens: MemeToken[];
  onClose: () => void;
  onAdd: (token: Omit<MemeToken, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onRemove: (contractAddress: string) => Promise<void>;
}

export default function ManageMemeTokensModal({
  tokens,
  onClose,
  onAdd,
  onRemove
}: ManageMemeTokensModalProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [searchResult, setSearchResult] = useState<TokenInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!contractAddress) return;
    
    setIsSearching(true);
    setError(null);

    try {
      // 使用本地 API 路由
      const response = await axios.get('/api/okx/token', {
        params: {
          tokenAddress: contractAddress
        }
      });

      if (!response.data?.data?.[0]) {
        throw new Error('未找到代币信息');
      }

      const tokenInfo = response.data.data[0];
      console.log('Token info from API:', tokenInfo);

      // 确保必要字段有值
      if (!tokenInfo.name && !tokenInfo.symbol) {
        throw new Error('代币信息不完整');
      }

      setSearchResult({
        name: tokenInfo.name || 'Unknown Token',
        symbol: tokenInfo.symbol || 'UNKNOWN',
        contract_address: contractAddress,
        decimals: parseInt(tokenInfo.tokenDecimal || '0'),
        logoURI: tokenInfo.logoUrl || '',
        tags: tokenInfo.verified ? ['已验证'] : undefined
      });

    } catch (err) {
      console.error('Search error:', err);
      if (axios.isAxiosError(err)) {
        const errorMsg = err.response?.data?.msg || err.message;
        setError(`搜索失败: ${errorMsg}`);
      } else {
        setError(err instanceof Error ? err.message : '搜索失败');
      }
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult) return;
    
    try {
      // 确保所有必要字段都有值
      const tokenData = {
        name: searchResult.name || 'Unknown Token',
        symbol: searchResult.symbol || 'UNKNOWN',
        contract_address: searchResult.contract_address,
        logoUrl: searchResult.logoURI || '',
        volume24h: searchResult.volume24h || '',
        marketCap: searchResult.marketCap || ''
      };

      console.log('Adding token with data:', tokenData);
      await onAdd(tokenData);
      setContractAddress('');
      setSearchResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">管理 Meme 币</h3>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* 搜索区域 - 固定在顶部 */}
          <div className="flex gap-2 sticky top-0 bg-white py-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder={`输入 SOL 代币合约地址`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !contractAddress}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  搜索中...
                </span>
              ) : '搜索'}
            </button>
          </div>

          {/* 搜索结果 */}
          {searchResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {searchResult.logoURI && (
                    <div className="relative w-8 h-8">
                      <Image 
                        src={searchResult.logoURI} 
                        alt={`${searchResult.name} (${searchResult.symbol}) 代币图标`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-lg">{searchResult.name}</h4>
                    <p className="text-gray-500">{searchResult.symbol}</p>
                    <p className="text-xs text-gray-400 mt-1 break-all">
                      {searchResult.contract_address}
                    </p>
                    {searchResult.tags && searchResult.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {searchResult.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  添加
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* 已添加的代币列表 - 可滚动区域 */}
          <div className="flex-1 overflow-auto min-h-0">
            <h4 className="text-lg font-medium text-gray-700 mb-3 sticky top-0 bg-white py-2">
              已添加的代币
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {tokens.map((token) => (
                <div
                  key={token.contract_address}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{token.name}</p>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                    <p className="text-xs text-gray-400 mt-1 break-all">
                      {token.contract_address}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(token.contract_address)}
                    className="text-red-500 hover:text-red-600 ml-2 shrink-0"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 