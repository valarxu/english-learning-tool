'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReactECharts from 'echarts-for-react';

export default function BacktestPage() {
  const [activeStrategy, setActiveStrategy] = useState('ema-atr');
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [activeYear, setActiveYear] = useState<string>('2024');
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 策略选项
  const strategies = [
    { key: 'ema-atr', label: 'EMA-ATR策略', icon: '📊' },
    { key: 'supertrend', label: 'Supertrend策略', icon: '📈' }
  ];

  // 交易对选项
  const symbols = [
    { key: 'BTC', label: 'BTC' },
    { key: 'ETH', label: 'ETH' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 修改数据加载路径
        const tradesResponse = await fetch(`/data/jsonData/${activeSymbol.toLowerCase()}_filtered.json`);
        if (!tradesResponse.ok) {
          throw new Error('Failed to load trades data');
        }
        const tradesData = await tradesResponse.json();
        
        const statsResponse = await fetch(`/data/tradeStats/${activeSymbol.toLowerCase()}_filtered_stats.json`);
        if (!statsResponse.ok) {
          throw new Error('Failed to load stats data');
        }
        const statsData = await statsResponse.json();

        // 设置年份列表
        const availableYears = Object.keys(statsData).sort().reverse();
        setYears(availableYears);
        
        // 过滤当前年份的交易数据并按时间升序排序
        const yearTrades = tradesData
          .filter((trade: any) => trade.datetime.startsWith(activeYear))
          .sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        
        setTrades(yearTrades);
        setStats(statsData[activeYear]);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeStrategy, activeSymbol, activeYear]);

  // 图表配置
  const getChartOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          return `
            日期: ${trades[data.dataIndex].datetime}<br/>
            方向: ${trades[data.dataIndex].signal}<br/>
            收益: ${data.value} USDT
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trades.map((_, index) => (index + 1).toString()),
        axisLabel: {
          interval: Math.floor(trades.length / 10)
        }
      },
      yAxis: {
        type: 'value',
        name: '收益 (USDT)'
      },
      series: [{
        name: '交易收益',
        type: 'bar',
        data: trades.map(trade => ({
          value: trade.profit_usdt,
          itemStyle: {
            color: trade.profit_usdt >= 0 ? '#26a69a' : '#ef5350'
          }
        }))
      }]
    };
  };

  return (
    <ProtectedRoute>
      <div className="page-gradient-bg">
        <Link 
          href="/"
          className="absolute top-4 left-4 px-4 py-2 rounded-lg bg-white/90 text-emerald-600 
            transition-all duration-300 backdrop-blur-md font-medium
            hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 
            active:scale-95 active:translate-y-0
            flex items-center gap-1 group"
        >
          <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>返回首页</span>
        </Link>

        <div className="max-w-6xl mx-auto pt-16">
          {/* 策略选择 */}
          <div className="mb-6 inline-flex bg-white/90 rounded-lg p-1 gap-2 shadow-lg">
            {strategies.map(strategy => (
              <button
                key={strategy.key}
                onClick={() => setActiveStrategy(strategy.key)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                  activeStrategy === strategy.key
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-emerald-50 text-gray-600'
                }`}
              >
                <span>{strategy.icon}</span>
                <span>{strategy.label}</span>
              </button>
            ))}
          </div>

          {/* 交易对选择 */}
          <div className="mb-6 inline-flex bg-white/90 rounded-lg p-1 gap-2 shadow-lg ml-4">
            {symbols.map(symbol => (
              <button
                key={symbol.key}
                onClick={() => setActiveSymbol(symbol.key)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSymbol === symbol.key
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-emerald-50 text-gray-600'
                }`}
              >
                {symbol.label}
              </button>
            ))}
          </div>

          {/* 年份选择 */}
          <div className="mb-6 inline-flex bg-white/90 rounded-lg p-1 gap-2 shadow-lg ml-4">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeYear === year
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-emerald-50 text-gray-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : (
            <>
              {/* 统计数据展示 */}
              {stats && (
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-gray-600 mb-1">总交易次数</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats.trade_counts.total}</p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-gray-600 mb-1">多空比例</h3>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.trade_counts.long}/{stats.trade_counts.short}
                    </p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-gray-600 mb-1">总收益</h3>
                    <p className={`text-2xl font-bold ${stats.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {stats.total_profit.toFixed(2)} USDT
                    </p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-gray-600 mb-1">最大单笔收益</h3>
                    <p className="text-2xl font-bold text-emerald-600">
                      {Math.max(stats.long_stats.max_profit, stats.short_stats.max_profit).toFixed(2)} USDT
                    </p>
                  </div>
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-gray-600 mb-1">最大单笔亏损</h3>
                    <p className="text-2xl font-bold text-red-500">
                      {Math.min(stats.long_stats.max_loss, stats.short_stats.max_loss).toFixed(2)} USDT
                    </p>
                  </div>
                </div>
              )}

              {/* 图表展示 */}
              {trades.length > 0 && (
                <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                  <ReactECharts option={getChartOption()} style={{ height: '400px' }} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 