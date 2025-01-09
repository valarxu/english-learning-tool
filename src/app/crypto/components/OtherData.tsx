'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/config/supabase';
import type { MarketMetrics } from '@/types/crypto';
import { useAuth } from '@/contexts/AuthContext';

interface OtherDataProps {
  metrics: MarketMetrics | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type LeftDataTab = 'defi' | 'chains' | 'stablecoins' | 'chainStables';
type RightDataTab = 'yields' | 'volumes' | 'fees';

const LEFT_TABS: { key: LeftDataTab; label: string; icon: string }[] = [
  { key: 'defi', label: 'DeFi 协议 TVL', icon: '🏦' },
  { key: 'chains', label: '链 TVL', icon: '⛓️' },
  { key: 'stablecoins', label: '稳定币流通量', icon: '💵' },
  { key: 'chainStables', label: '链上稳定币市值', icon: '🔗' },
];

const RIGHT_TABS: { key: RightDataTab; label: string; icon: string }[] = [
  { key: 'yields', label: '收益率', icon: '📈' },
  { key: 'volumes', label: '交易量', icon: '💹' },
  { key: 'fees', label: '费用收入', icon: '💰' },
];

export default function OtherData({ metrics: initialMetrics, onRefresh, isLoading }: OtherDataProps) {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(initialMetrics);
  const [activeLeftTab, setActiveLeftTab] = useState<LeftDataTab>('defi');
  const [activeRightTab, setActiveRightTab] = useState<RightDataTab>('yields');
  const { username } = useAuth();

  // 从数据库获取缓存数据
  const fetchCachedMetrics = useCallback(async () => {
    if (!username) return;

    try {
      const { data, error } = await supabase
        .from('cached_metrics')
        .select('metrics')
        .eq('user_id', username)
        .single();

      if (error) {
        console.error('Error fetching cached metrics:', error);
        // 如果没有缓存数据，则调用刷新方法获取新数据
        if (error.code === 'PGRST116') {
          onRefresh?.();
        }
        return;
      }

      if (data?.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error in fetchCachedMetrics:', err);
    }
  }, [username, onRefresh]);

  // 初始加载时，如果没有初始数据则从缓存获取
  useEffect(() => {
    if (!initialMetrics) {
      void fetchCachedMetrics();
    } else {
      setMetrics(initialMetrics);
    }
  }, [initialMetrics, fetchCachedMetrics]);

  return (
    <div className="space-y-6">
      {/* Loading遮罩 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">数据加载中...</span>
          </div>
        </div>
      )}
      
      {/* 第一行：基础指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 恐慌贪婪指数 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg w-full">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>😨</span>
            恐慌贪婪指数
          </h3>
          {metrics?.fearGreedIndex ? (
            <div className="space-y-2">
              <div className="text-4xl font-bold text-center">
                {metrics.fearGreedIndex.value}
              </div>
              <div className="text-center text-gray-600">
                {metrics.fearGreedIndex.classification}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 市场占比 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg w-full">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>📈</span>
            市场占比
          </h3>
          {metrics?.marketDominance ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">BTC占比:</span>
                <span className="font-medium">
                  {metrics.marketDominance.btc.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">稳定币占比:</span>
                <span className="font-medium">
                  {metrics.marketDominance.stablecoins.toFixed(2)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 全局数据 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg w-full">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>🌍</span>
            全局数据
          </h3>
          {metrics?.globalMetrics ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">总市值:</span>
                <span className="font-medium">
                  ${metrics.globalMetrics.totalMarketCap}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">24h总成交量:</span>
                <span className="font-medium">
                  ${metrics.globalMetrics.total24hVolume}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>
      </div>

      {/* 数据表格区域 */}
      <div className="flex gap-6">
        {/* 左侧部分 */}
        <div className="flex gap-6 flex-1">
          {/* 左侧标签栏 */}
          <div className="w-48 shrink-0">
            <div className="bg-white/90 rounded-lg p-2 shadow-lg">
              {LEFT_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveLeftTab(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2
                    ${activeLeftTab === tab.key 
                      ? 'bg-emerald-500 text-white' 
                      : 'hover:bg-emerald-50 text-gray-600'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 左侧内容区 */}
          <div className="flex-1">
            <div className="bg-white/90 rounded-lg p-6 shadow-lg">
              {activeLeftTab === 'defi' && metrics?.defiProtocols && (
                <div className="overflow-x-auto">
                  {/* DeFi 协议 TVL 表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">协议</th>
                        <th className="pb-2">类别</th>
                        <th className="pb-2 text-right">TVL</th>
                        <th className="pb-2 text-right">24h变化</th>
                        <th className="pb-2 text-right">7d变化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.defiProtocols.protocols.map((protocol, index) => (
                        <tr key={protocol.name} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{protocol.name}</td>
                          <td className="py-2 text-gray-600">{protocol.category}</td>
                          <td className="py-2 text-right">${protocol.tvl}</td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change1d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change1d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change7d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change7d}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeLeftTab === 'chains' && metrics?.defiChains && (
                <div className="overflow-x-auto">
                  {/* 链 TVL 表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">链</th>
                        <th className="pb-2">代币</th>
                        <th className="pb-2 text-right">TVL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.defiChains.chains.map((chain, index) => (
                        <tr key={chain.name} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{chain.name}</td>
                          <td className="py-2 text-gray-600">{chain.tokenSymbol}</td>
                          <td className="py-2 text-right">${chain.tvl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeLeftTab === 'stablecoins' && metrics?.stablecoins && (
                <div className="overflow-x-auto">
                  {/* 稳定币流通量表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">名称</th>
                        <th className="pb-2">代币</th>
                        <th className="pb-2 text-right">流通量</th>
                        <th className="pb-2 text-right">24h变化</th>
                        <th className="pb-2 text-right">7d变化</th>
                        <th className="pb-2 text-right">30d变化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.stablecoins.map((coin, index) => (
                        <tr key={coin.symbol} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{coin.name}</td>
                          <td className="py-2 text-gray-600">{coin.symbol}</td>
                          <td className="py-2 text-right">${coin.circulating}</td>
                          <td className={`py-2 text-right ${
                            parseFloat(coin.change1d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {coin.change1d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(coin.change7d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {coin.change7d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(coin.change30d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {coin.change30d}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeLeftTab === 'chainStables' && metrics?.chainStables && (
                <div className="overflow-x-auto">
                  {/* 链上稳定币市值表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">链</th>
                        <th className="pb-2 text-right">稳定币总市值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.chainStables.map((chain, index) => (
                        <tr key={chain.name} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{chain.name}</td>
                          <td className="py-2 text-right">${chain.totalCirculating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧部分 */}
        <div className="flex gap-6 flex-1">
          {/* 右侧标签栏 */}
          <div className="w-48 shrink-0">
            <div className="bg-white/90 rounded-lg p-2 shadow-lg">
              {RIGHT_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveRightTab(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2
                    ${activeRightTab === tab.key 
                      ? 'bg-emerald-500 text-white' 
                      : 'hover:bg-emerald-50 text-gray-600'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右侧内容区 */}
          <div className="flex-1">
            <div className="bg-white/90 rounded-lg p-6 shadow-lg">
              {activeRightTab === 'yields' && metrics?.yields && (
                <div className="overflow-x-auto">
                  {/* 收益率表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">资产</th>
                        <th className="pb-2">链</th>
                        <th className="pb-2">项目</th>
                        <th className="pb-2 text-right">TVL</th>
                        <th className="pb-2 text-right">APY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.yields.protocols.map((protocol, index) => (
                        <tr key={`${protocol.name}-${protocol.symbol}-${protocol.project}-${index}`} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{protocol.name}</td>
                          <td className="py-2 text-gray-600">{protocol.symbol}</td>
                          <td className="py-2">{protocol.project}</td>
                          <td className="py-2 text-right">${protocol.tvl}</td>
                          <td className="py-2 text-right text-green-500">{protocol.apy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeRightTab === 'volumes' && metrics?.volumes && (
                <div className="overflow-x-auto">
                  {/* 交易量表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">协议</th>
                        <th className="pb-2">类别</th>
                        <th className="pb-2 text-right">24h交易量</th>
                        <th className="pb-2 text-right">7d交易量</th>
                        <th className="pb-2 text-right">30d交易量</th>
                        <th className="pb-2 text-right">24h变化</th>
                        <th className="pb-2 text-right">7d变化</th>
                        <th className="pb-2 text-right">30d变化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.volumes.protocols.map((protocol, index) => (
                        <tr key={protocol.name} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{protocol.name}</td>
                          <td className="py-2 text-gray-600">{protocol.category}</td>
                          <td className="py-2 text-right">${protocol.volume24h}</td>
                          <td className="py-2 text-right">${protocol.volume7d}</td>
                          <td className="py-2 text-right">${protocol.volume30d}</td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change1d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change1d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change7d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change7d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change30d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change30d}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeRightTab === 'fees' && metrics?.fees && (
                <div className="overflow-x-auto">
                  {/* 费用收入表格 */}
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600 border-b">
                        <th className="pb-2">排名</th>
                        <th className="pb-2">协议</th>
                        <th className="pb-2">类别</th>
                        <th className="pb-2 text-right">24h</th>
                        <th className="pb-2 text-right">7d</th>
                        <th className="pb-2 text-right">30d</th>
                        <th className="pb-2 text-right">24h变化</th>
                        <th className="pb-2 text-right">7d变化</th>
                        <th className="pb-2 text-right">30d变化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.fees.protocols.map((protocol, index) => (
                        <tr key={protocol.name} className="border-b last:border-0">
                          <td className="py-2 text-gray-500">{index + 1}</td>
                          <td className="py-2 font-medium">{protocol.name}</td>
                          <td className="py-2 text-gray-600">{protocol.category}</td>
                          <td className="py-2 text-right">${protocol.volume24h}</td>
                          <td className="py-2 text-right">${protocol.volume7d}</td>
                          <td className="py-2 text-right">${protocol.volume30d}</td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change1d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change1d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change7d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change7d}%
                          </td>
                          <td className={`py-2 text-right ${
                            parseFloat(protocol.change30d) >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {protocol.change30d}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!metrics && (
                <div className="text-gray-500 text-center">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}