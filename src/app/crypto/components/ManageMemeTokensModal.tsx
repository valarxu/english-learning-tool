'use client';

import { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import type { MemeToken } from '@/types/crypto';

interface TokenInfo {
  name: string;
  symbol: string;
  contract_address: string;
  decimals: number;
  totalSupply?: string;
}

interface TokenData {
  program: string;
  parsed: {
    type: string;
    info: {
      name: string;
      symbol: string;
      decimals: number;
      supply?: string;
    };
  };
}

interface ManageMemeTokensModalProps {
  tokens: MemeToken[];
  onClose: () => void;
  onAdd: (token: Omit<MemeToken, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onRemove: (contractAddress: string) => Promise<void>;
}

const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana',
  'https://solana-api.projectserum.com'
];

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
      // 尝试所有 RPC 节点
      for (const endpoint of RPC_ENDPOINTS) {
        try {
          // 验证地址格式
          const pubkey = new PublicKey(contractAddress);
          
          // 连接到 Solana 节点
          const connection = new Connection(endpoint);
          
          // 获取代币信息
          const tokenInfo = await connection.getParsedAccountInfo(pubkey);
          
          if (!tokenInfo.value || !tokenInfo.value.data) {
            throw new Error('无效的代币地址');
          }

          // 类型断言
          const tokenData = tokenInfo.value.data as TokenData;
          
          if (!tokenData.parsed || !tokenData.parsed.info) {
            throw new Error('无效的代币数据格式');
          }

          // 解析代币信息
          setSearchResult({
            name: tokenData.parsed.info.name || 'Unknown',
            symbol: tokenData.parsed.info.symbol || 'Unknown',
            contract_address: contractAddress,
            decimals: tokenData.parsed.info.decimals || 0,
            totalSupply: tokenData.parsed.info.supply?.toString() || '0'
          });

          // 成功获取数据后退出循环
          return;
        } catch (err) {
          // 如果是最后一个节点且失败，则抛出错误
          if (endpoint === RPC_ENDPOINTS[RPC_ENDPOINTS.length - 1]) {
            console.error('Search error:', err);
            if (err instanceof Error && err.message.includes('403')) {
              setError('RPC 节点访问受限，请稍后再试');
            } else {
              setError(err instanceof Error ? err.message : '搜索失败');
            }
            setSearchResult(null);
          }
          // 否则继续尝试下一个节点
          continue;
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult) return;
    
    try {
      await onAdd({
        name: searchResult.name,
        symbol: searchResult.symbol,
        contract_address: searchResult.contract_address
      });
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
        className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-medium text-gray-800 mb-4">管理 Meme 币</h3>
        
        <div className="space-y-4">
          {/* 搜索区域 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="输入代币合约地址"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !contractAddress}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
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
                <div>
                  <h4 className="font-medium text-lg">{searchResult.name}</h4>
                  <p className="text-gray-500">{searchResult.symbol}</p>
                  <p className="text-xs text-gray-400 mt-1 break-all">{searchResult.contract_address}</p>
                </div>
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  添加
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">精度</p>
                  <p className="font-medium">{searchResult.decimals}</p>
                </div>
                {searchResult.totalSupply && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-500">总供应量</p>
                    <p className="font-medium">{searchResult.totalSupply}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* 已添加的代币列表 */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-700 mb-3">已添加的代币</h4>
            <div className="space-y-2">
              {tokens.map((token) => (
                <div 
                  key={token.contract_address}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                    <p className="text-xs text-gray-400 mt-1 break-all">{token.contract_address}</p>
                  </div>
                  <button
                    onClick={() => onRemove(token.contract_address)}
                    className="text-red-500 hover:text-red-600"
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