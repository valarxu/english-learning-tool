'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCryptoSymbols } from '@/hooks/useCryptoSymbols';
import type {
  KLineData,
  CryptoData,
  LoadingState,
  MarketMetrics
} from '@/types/crypto';
import type { CryptoTab, TabConfig } from '@/types/crypto-tabs';
import MainstreamCoins from './components/MainstreamCoins';
import MemeCoins from './components/MemeCoins';
import OtherData from './components/OtherData';
import WalletMonitor from './components/WalletMonitor';
import ManageSymbolsModal from './components/ManageSymbolsModal';
import ManageMemeTokensModal from './components/ManageMemeTokensModal';
import { useMemeTokens } from '@/hooks/useMemeTokens';
import { supabase } from '@/config/supabase';
import { fetchOKXToken, fetchMetricsFromAPI } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

// 移除未使用的 ECharts 相关类型
const TABS: TabConfig[] = [
  { key: 'mainstream', label: '主流货币', icon: '💰' },
  { key: 'meme', label: 'Meme币', icon: '🐕' },
  { key: 'others', label: '其他数据', icon: '📊' },
  { key: 'wallet', label: '钱包监控', icon: '👛' },
];

export default function CryptoPage() {
  const [activeTab, setActiveTab] = useState<CryptoTab>('mainstream');

  // 主流货币状态
  const [mainstreamData, setMainstreamData] = useState<CryptoData>({});
  const [mainstreamLoading, setMainstreamLoading] = useState(false);
  const [mainstreamLoadingStates, setMainstreamLoadingStates] = useState<LoadingState>({});
  const [mainstreamLastUpdate, setMainstreamLastUpdate] = useState<string>('');
  const [mainstreamNewSymbol, setMainstreamNewSymbol] = useState('');

  // 通用状态
  const [error, setError] = useState<string | null>(null);
  const [isMainstreamModalOpen, setIsMainstreamModalOpen] = useState(false);

  const {
    symbols: mainstreamSymbols,
    addSymbol: addMainstreamSymbol,
    removeSymbol: removeMainstreamSymbol
  } = useCryptoSymbols('mainstream');

  // 使用 useMemeTokens hook
  const {
    tokens: memeTokens,
    fetchTokens,
    addToken: addMemeToken,
    removeToken: removeMemeToken
  } = useMemeTokens();

  // Meme 币状态
  const [isMemeDataLoading, setIsMemeDataLoading] = useState(false);
  const [memeLastUpdate, setMemeLastUpdate] = useState<string>('');
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false);

  // 添加其他数据相关的状态
  const [otherDataLoading, setOtherDataLoading] = useState(false);
  const [otherDataLastUpdate, setOtherDataLastUpdate] = useState<string>('');

  // 修改状态定义，移除 null 类型
  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>({
    fearGreedIndex: undefined,
    marketDominance: undefined,
    globalMetrics: undefined,
    liquidations: undefined,
    etfFlows: undefined
  });

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 30000; // 30秒

  const { username } = useAuth();

  const fetchSymbolData = useCallback(async (symbol: string, retryCount = 0): Promise<KLineData[]> => {
    try {
      // 获取当前 UTC 时间
      const now = new Date();

      // 设置 UTC 时区的结束时间点为后天凌晨（多预留一天）
      const endTime = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1  // 加2天
      ));

      // 设置开始时间为 31 天前
      const startTime = new Date(endTime);
      startTime.setUTCDate(startTime.getUTCDate() - 31);

      const response = await axios.get('https://api.binance.com/api/v3/klines', {
        params: {
          symbol: `${symbol}USDT`,
          interval: '1d',
          startTime: startTime.getTime(),
          endTime: endTime.getTime() - 1,
          limit: 30
        }
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      return response.data.map((item: any) => ({
        time: new Date(item[0]).toLocaleDateString(),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5])
      }));
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchSymbolData(symbol, retryCount + 1);
      }
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      throw new Error(`获取 ${symbol} 数据失败: ${errorMessage}`);
    }
  }, []);

  // 主流货币相关函数
  const fetchMainstreamData = useCallback(async () => {
    if (mainstreamSymbols.length === 0) return;

    setMainstreamLoading(true);
    setError(null);

    const initialLoadingStates: LoadingState = {};
    mainstreamSymbols.forEach(symbol => {
      initialLoadingStates[symbol] = true;
    });
    setMainstreamLoadingStates(initialLoadingStates);

    try {
      const results = await Promise.all(
        mainstreamSymbols.map(symbol => fetchSymbolData(symbol))
      );

      const newData: CryptoData = {};
      mainstreamSymbols.forEach((symbol, index) => {
        newData[symbol] = results[index];
      });

      setMainstreamData(newData);
      setMainstreamLastUpdate(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setMainstreamLoading(false);
      setMainstreamLoadingStates({});
    }
  }, [mainstreamSymbols, fetchSymbolData]);

  // 初始加载
  const mainstreamInitialLoad = useRef(false);

  useEffect(() => {
    if (mainstreamSymbols.length > 0 && !mainstreamInitialLoad.current) {
      mainstreamInitialLoad.current = true;
      void fetchMainstreamData();
    }
  }, [mainstreamSymbols, fetchMainstreamData]);

  // 添加错误消失的 useEffect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 修改 fetchMemeTokensData 函数
  const fetchMemeTokensData = useCallback(async () => {
    if (!memeTokens || memeTokens.length === 0) return;

    setIsMemeDataLoading(true);
    setError(null);

    try {
      for (const token of memeTokens) {
        if (!token.contract_address) continue;

        const response = await fetchOKXToken(token.contract_address);

        if (response?.data?.data?.[0]) {
          const tokenInfo = response.data.data[0];
          const { error: updateError } = await supabase
            .from('meme_tokens')
            .update({
              volume24h: tokenInfo.volume24h || '',
              marketCap: tokenInfo.marketCap || '',
              updated_at: new Date().toISOString()
            })
            .eq('contract_address', token.contract_address);

          if (updateError) {
            console.error('Error updating token:', updateError);
            continue;
          }
        }
      }

      await fetchTokens();
      setMemeLastUpdate(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching meme tokens:', err);
      setError(err instanceof Error ? err.message : '获取 Meme 币数据失败');
    } finally {
      setIsMemeDataLoading(false);
    }
  }, [memeTokens, fetchTokens]);

  // 添加复制地址功能
  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        // 可以添加一个提示
        console.log('地址已复制');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }, []);

  // 处理标签切换
  const handleTabChange = (tab: CryptoTab) => {
    setActiveTab(tab);
    // 切换到 Meme 标签时只获取列表，不刷新数据
    if (tab === 'meme') {
      void fetchTokens();
    }
    // 切换到其他数据标签时，获取缓存数据
    else if (tab === 'others' && username) {
      // 从数据库获取最新的缓存数据
      void supabase
        .from('cached_metrics')
        .select('metrics, last_updated')
        .eq('user_id', username)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching cached metrics:', error);
            // 如果没有缓存数据，则获取新数据
            if (error.code === 'PGRST116') {
              void handleOtherDataRefresh();
            }
            return;
          }

          if (data?.metrics) {
            setMarketMetrics(data.metrics);
            setOtherDataLastUpdate(new Date(data.last_updated).toLocaleString());
          }
        });
    }
  };

  

  // 修改统一的刷新方法
  const handleOtherDataRefresh = useCallback(async () => {
    if (!username) return;
    
    setOtherDataLoading(true);
    try {
      const newMetrics = await fetchMetricsFromAPI();
      setMarketMetrics(newMetrics);
      setOtherDataLastUpdate(new Date().toLocaleString());

      // 一次性保存所有数据到数据库
      const { error } = await supabase
        .from('cached_metrics')
        .upsert({
          user_id: username,
          metrics: newMetrics,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving metrics to cache:', error);
      }
    } catch (err) {
      console.error('Error refreshing other data:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setOtherDataLoading(false);
    }
  }, [username]);

  // 渲染当前标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'mainstream':
        return (
          <MainstreamCoins
            klineData={mainstreamData}
            symbols={mainstreamSymbols}
            loading={mainstreamLoading}
            loadingStates={mainstreamLoadingStates}
            lastUpdate={mainstreamLastUpdate}
            onRefresh={fetchMainstreamData}
            onOpenModal={() => setIsMainstreamModalOpen(true)}
          />
        );
      case 'meme':
        return (
          <MemeCoins
            tokens={memeTokens}
            onCopyAddress={handleCopyAddress}
            isLoading={isMemeDataLoading}
          />
        );
      case 'others':
        return (
          <OtherData
            metrics={marketMetrics}
            onRefresh={handleOtherDataRefresh}
            isLoading={otherDataLoading}
          />
        );
      case 'wallet':
        return <WalletMonitor />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // 添加日志来检查数据
    console.log('Mainstream symbols:', mainstreamSymbols);
    console.log('Meme tokens:', memeTokens);
  }, [mainstreamSymbols, memeTokens]);

  return (
    <ProtectedRoute>
      <div className="page-gradient-bg">
        {/* 顶部导航栏 */}
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/"
            className="h-9 px-3 rounded-lg bg-white/90 text-emerald-600 
              transition-all duration-300 backdrop-blur-md font-medium
              hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 
              active:scale-95 active:translate-y-0
              flex items-center gap-1 group"
          >
            <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
            <span>返回首页</span>
          </Link>
        </div>

        {/* 主要内容区域 */}
        <div className="mx-[100px]">
          {/* 标签切换和操作按钮 */}
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex bg-white/90 rounded-lg p-1 gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${activeTab === tab.key
                      ? 'bg-emerald-500 text-white'
                      : 'hover:bg-emerald-50 text-gray-600'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 根据当前标签显示对应的操作按钮 */}
            {activeTab === 'mainstream' && (
              <div className="flex items-center gap-4">
                {mainstreamLastUpdate && (
                  <span className="text-sm text-gray-500">
                    更新于: {mainstreamLastUpdate}
                  </span>
                )}
                <button
                  onClick={() => setIsMainstreamModalOpen(true)}
                  className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  管理货币
                </button>
                <button
                  onClick={fetchMainstreamData}
                  disabled={mainstreamLoading}
                  className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
                >
                  {mainstreamLoading ? '加载中...' : '刷新数据'}
                </button>
              </div>
            )}

            {activeTab === 'meme' && (
              <div className="flex items-center gap-4">
                {memeLastUpdate && (
                  <span className="text-sm text-gray-500">
                    更新于: {memeLastUpdate}
                  </span>
                )}
                <button
                  onClick={() => setIsMemeModalOpen(true)}
                  className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  管理 Meme 币
                </button>
                <button
                  onClick={fetchMemeTokensData}
                  disabled={isMemeDataLoading}
                  className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isMemeDataLoading ? '加载中...' : '刷新数据'}
                </button>
              </div>
            )}

            {activeTab === 'others' && (
              <div className="flex items-center gap-4">
                {otherDataLastUpdate && (
                  <span className="text-sm text-gray-500">
                    更新于: {otherDataLastUpdate}
                  </span>
                )}
                <button
                  onClick={handleOtherDataRefresh}
                  disabled={otherDataLoading}
                  className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg 
                    hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
                >
                  {otherDataLoading ? '加载中...' : '刷新数据'}
                </button>
              </div>
            )}
          </div>

          {/* 容区域 */}
          {renderTabContent()}
        </div>

        {/* 只保留主流货币的弹窗 */}
        {isMainstreamModalOpen && (
          <ManageSymbolsModal
            title="管理主流货币"
            symbols={mainstreamSymbols}
            newSymbol={mainstreamNewSymbol}
            onClose={() => setIsMainstreamModalOpen(false)}
            onAdd={async () => {
              try {
                await addMainstreamSymbol(mainstreamNewSymbol);
                setMainstreamNewSymbol('');
                setIsMainstreamModalOpen(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : '添加货币失败');
              }
            }}
            onRemove={async (symbol) => {
              try {
                await removeMainstreamSymbol(symbol);
                setMainstreamData(prev => {
                  const newData = { ...prev };
                  delete newData[symbol];
                  return newData;
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : '删除货币失败');
              }
            }}
            onSymbolChange={(value) => setMainstreamNewSymbol(value.toUpperCase())}
          />
        )}

        {/* 使用新的 Meme 币管理弹窗 */}
        {isMemeModalOpen && (
          <ManageMemeTokensModal
            tokens={memeTokens}
            onClose={() => setIsMemeModalOpen(false)}
            onAdd={addMemeToken}
            onRemove={removeMemeToken}
          />
        )}

        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}