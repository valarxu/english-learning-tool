'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ReactECharts from 'echarts-for-react';

export default function BacktestPage() {
  const [activeStrategy, setActiveStrategy] = useState('ema-atr');
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [activeYear, setActiveYear] = useState<string>('2024');
  const [activeComparisonSymbol, setActiveComparisonSymbol] = useState('BTC');
  const [trades, setTrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [years, setYears] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // 策略选项
  const strategies = [
    { key: 'ema-atr', label: 'EMA-ATR策略', icon: '📊' },
    { key: 'supertrend', label: 'Supertrend策略', icon: '📈' }
  ];

  // 使用 useMemo 缓存交易对选项
  const symbols = useMemo(() => [
    { key: 'BTC', label: 'BTC' },
    { key: 'ETH', label: 'ETH' },
    { key: 'SOL', label: 'SOL' },
    { key: 'DOGE', label: 'DOGE' },
    { key: 'XRP', label: 'XRP' },
    { key: 'ADA', label: 'ADA' },
    { key: 'BNB', label: 'BNB' },
    { key: 'UNI', label: 'UNI' },
    { key: 'ATOM', label: 'ATOM' },
    { key: 'THETA', label: 'THETA' },
  ], []); // 空依赖数组，因为这个数组是静态的

  useEffect(() => {
    // 将加载对比数据的函数移到 useEffect 内部
    const loadComparisonData = async () => {
      try {
        const strategies = ['ema-atr', 'supertrend'];
        const comparisonResult: any = {};

        for (const symbol of symbols) {
          comparisonResult[symbol.key] = {};
          
          for (const strategy of strategies) {
            const dataPath = strategy === 'ema-atr' ? 'data1' : 'data2';
            const response = await fetch(`/${dataPath}/tradeStats/${symbol.key.toLowerCase()}_filtered_stats.json`);
            if (response.ok) {
              const data = await response.json();
              comparisonResult[symbol.key][strategy] = data;
            }
          }
        }

        setComparisonData(comparisonResult);
      } catch (error) {
        console.error('Error loading comparison data:', error);
      }
    };

    loadComparisonData();
  }, [symbols]); // 添加 symbols 作为依赖项

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 修改数据加载路径
        let dataPath;
        if (activeStrategy === 'ema-atr') {
          dataPath = 'data1'
        }
        if (activeStrategy === 'supertrend') {
          dataPath = 'data2'
        }
        const tradesResponse = await fetch(`/${dataPath}/jsonData/${activeSymbol.toLowerCase()}_filtered.json`);
        if (!tradesResponse.ok) {
          throw new Error('Failed to load trades data');
        }
        const tradesData = await tradesResponse.json();
        
        const statsResponse = await fetch(`/${dataPath}/tradeStats/${activeSymbol.toLowerCase()}_filtered_stats.json`);
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

  // 添加计算总计数据的函数
  const calculateTotalStats = (strategyData: any) => {
    if (!strategyData) return { totalProfit: 0, avgWinRate: 0 };
    
    const years = Object.keys(strategyData);
    if (years.length === 0) return { totalProfit: 0, avgWinRate: 0 };

    const totalProfit = years.reduce((sum, year) => {
      return sum + (strategyData[year]?.total_profit || 0);
    }, 0);

    const avgWinRate = years.reduce((sum, year) => {
      return sum + (strategyData[year]?.win_rates?.total || 0);
    }, 0) / years.length;

    return { totalProfit, avgWinRate };
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
          <div className="mb-6 inline-flex bg-white/90 rounded-lg p-1 gap-2 shadow-lg">
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
                    <h3 className="text-gray-600 mb-1">胜率</h3>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.win_rates.total}%
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
                  
                  <div className="ml-8">备注：本金为10000 USDT, 杠杆为1倍</div>
                </div>
                
              )}
            </>
          )}

          {/* 修改策略对比表格 */}
          {comparisonData && (
            <div className="mt-8 bg-white/90 rounded-lg p-6 shadow-lg overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">策略对比分析</h2>
                <div className="flex gap-2">
                  {symbols.map(symbol => (
                    <button
                      key={symbol.key}
                      onClick={() => setActiveComparisonSymbol(symbol.key)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeComparisonSymbol === symbol.key
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white hover:bg-emerald-50 text-gray-600'
                      }`}
                    >
                      {symbol.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">年份</th>
                    <th className="py-2 px-4 text-left">EMA-ATR收益</th>
                    <th className="py-2 px-4 text-left">EMA-ATR胜率</th>
                    <th className="py-2 px-4 text-left">Supertrend收益</th>
                    <th className="py-2 px-4 text-left">Supertrend胜率</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData[activeComparisonSymbol] && 
                    Object.keys(comparisonData[activeComparisonSymbol]['ema-atr'] || {})
                      .sort()
                      .reverse()
                      .map((year) => (
                        <tr key={year} className="border-b hover:bg-emerald-50">
                          <td className="py-2 px-4">{year}</td>
                          <td className={`py-2 px-4 ${comparisonData[activeComparisonSymbol]['ema-atr']?.[year]?.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {comparisonData[activeComparisonSymbol]['ema-atr']?.[year]?.total_profit?.toFixed(2) || 'N/A'} USDT
                          </td>
                          <td className="py-2 px-4">
                            {comparisonData[activeComparisonSymbol]['ema-atr']?.[year]?.win_rates?.total?.toFixed(2) || 'N/A'}%
                          </td>
                          <td className={`py-2 px-4 ${comparisonData[activeComparisonSymbol]['supertrend']?.[year]?.total_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {comparisonData[activeComparisonSymbol]['supertrend']?.[year]?.total_profit?.toFixed(2) || 'N/A'} USDT
                          </td>
                          <td className="py-2 px-4">
                            {comparisonData[activeComparisonSymbol]['supertrend']?.[year]?.win_rates?.total?.toFixed(2) || 'N/A'}%
                          </td>
                        </tr>
                      ))
                  }
                  {/* 添加总计行 */}
                  {comparisonData[activeComparisonSymbol] && (() => {
                    const emaAtrStats = calculateTotalStats(comparisonData[activeComparisonSymbol]['ema-atr']);
                    const supertrendStats = calculateTotalStats(comparisonData[activeComparisonSymbol]['supertrend']);
                    
                    return (
                      <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                        <td className="py-3 px-4">历年总计</td>
                        <td className={`py-3 px-4 ${emaAtrStats.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {emaAtrStats.totalProfit.toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4">
                          {emaAtrStats.avgWinRate.toFixed(2)}%
                        </td>
                        <td className={`py-3 px-4 ${supertrendStats.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {supertrendStats.totalProfit.toFixed(2)} USDT
                        </td>
                        <td className="py-3 px-4">
                          {supertrendStats.avgWinRate.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 