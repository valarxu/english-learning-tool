'use client';

import { useState } from 'react';
import { Connection, PublicKey, Commitment } from '@solana/web3.js';
import Image from 'next/image';
import type { MemeToken } from '@/types/crypto';

interface TokenInfo {
  name: string;
  symbol: string;
  contract_address: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface TokenAccountData {
  parsed: {
    info: {
      decimals: number;
      freezeAuthority: string | null;
      isInitialized: boolean;
      mintAuthority: string | null;
      supply: string;
    };
    type: string;
  };
  program: string;
  space: number;
}

// 使用 QuickNode RPC
const RPC_URL = `https://api.quicknode.com/graphql/${process.env.NEXT_PUBLIC_QUICKNODE_API_KEY}`;

const connectionConfig = {
  commitment: 'confirmed' as Commitment,
  httpHeaders: {
    'x-api-key': process.env.NEXT_PUBLIC_QUICKNODE_API_KEY || '',
  }
};

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
      // 验证地址格式
      const mintPubkey = new PublicKey(contractAddress);
      
      // 使用 QuickNode RPC
      const connection = new Connection(RPC_URL, connectionConfig);

      // 获取代币账户信息
      const accountInfo = await connection.getParsedAccountInfo(mintPubkey);
      
      if (!accountInfo.value) {
        throw new Error('无效的代币地址');
      }

      const parsedData = accountInfo.value.data as TokenAccountData;
      
      if (!parsedData || !parsedData.parsed || parsedData.program !== 'spl-token') {
        throw new Error('无效的 SPL 代币');
      }

      // 获取代币元数据账户
      const [metadataPubkey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          mintPubkey.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );

      try {
        // 尝试获取元数据
        const metadataAccount = await connection.getAccountInfo(metadataPubkey);
        
        if (metadataAccount && metadataAccount.data) {
          // 解析元数据
          const metadata = decodeMetadata(metadataAccount.data);
          setSearchResult({
            name: metadata.data.name,
            symbol: metadata.data.symbol,
            contract_address: contractAddress,
            decimals: parsedData.parsed.info.decimals,
            logoURI: metadata.data.uri
          });
        } else {
          // 如果没有元数据，使用基本信息
          setSearchResult({
            name: `Token ${contractAddress.slice(0, 6)}...`,
            symbol: `TOKEN`,
            contract_address: contractAddress,
            decimals: parsedData.parsed.info.decimals
          });
        }
      } catch (_) {
        // 如果获取元数据失败，使用基本信息
        setSearchResult({
          name: `Token ${contractAddress.slice(0, 6)}...`,
          symbol: `TOKEN`,
          contract_address: contractAddress,
          decimals: parsedData.parsed.info.decimals
        });
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : '搜索失败');
      setSearchResult(null);
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
                <div className="flex items-center gap-3">
                  {searchResult.logoURI && (
                    <Image 
                      src={searchResult.logoURI} 
                      alt={searchResult.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-lg">{searchResult.name}</h4>
                    <p className="text-gray-500">{searchResult.symbol}</p>
                    <p className="text-xs text-gray-400 mt-1 break-all">{searchResult.contract_address}</p>
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

// 辅助函数：解析元数据
function decodeMetadata(_data: Buffer): any {
  // 这里需要实现元数据解析逻辑
  // 可以使用 @metaplex-foundation/mpl-token-metadata 库
  // 或者自己实现解析逻辑
  return {
    data: {
      name: 'Unknown',
      symbol: 'UNKNOWN',
      uri: ''
    }
  };
} 