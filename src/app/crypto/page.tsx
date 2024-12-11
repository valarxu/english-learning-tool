'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCryptoSymbols } from '@/hooks/useCryptoSymbols';
import type { KLineData, CryptoData, LoadingState } from '@/types/crypto';

// 添加 ECharts 相关类型
type EChartsOption = echarts.EChartsOption;
type ItemStyleParams = {
  dataIndex: number;
};

export default function CryptoPage() {
  const [klineData, setKlineData] = useState<CryptoData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const { symbols, fetchSymbols, addSymbol, removeSymbol } = useCryptoSymbols();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 30000; // 30秒

  const fetchSymbolData = useCallback(async (symbol: string, retryCount = 0): Promise<KLineData[]> => {
    try {
      const endTime = new Date();
      endTime.setHours(0, 0, 0, 0);
      const startTime = new Date(endTime);
      startTime.setDate(startTime.getDate() - 31);

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
      throw new Error(`获取 ${symbol} 数据失败`);
    }
  }, []);

  const fetchSingleSymbol = useCallback(async (symbol: string) => {
    setLoadingStates(prev => ({ ...prev, [symbol]: true }));
    
    try {
      const data = await fetchSymbolData(symbol, 0);
      setKlineData(prev => ({
        ...prev,
        [symbol]: data
      }));
    } catch {
      // 单个货币的错误不影响整体状态
    } finally {
      setLoadingStates(prev => ({ ...prev, [symbol]: false }));
    }
  }, [fetchSymbolData]);

  const fetchKlineData = useCallback(async () => {
    if (symbols.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const initialLoadingStates: LoadingState = {};
    symbols.forEach(symbol => {
      initialLoadingStates[symbol] = true;
    });
    setLoadingStates(initialLoadingStates);

    await Promise.all(symbols.map(fetchSingleSymbol));

    setLastUpdateTime(new Date().toLocaleString());
    setIsLoading(false);
  }, [symbols, fetchSingleSymbol]);

  useEffect(() => {
    if (symbols.length > 0) {
      void fetchKlineData();
    }
  }, [symbols, fetchKlineData]);

  const handleAddSymbol = async () => {
    if (!newSymbol) return;
    
    try {
      await addSymbol(newSymbol);
      setNewSymbol('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加货币失败');
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    try {
      await removeSymbol(symbol);
      setKlineData(prev => {
        const newData = { ...prev };
        delete newData[symbol];
        return newData;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除货币失败');
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    if (price < 0.0001) {
      return price.toFixed(8);
    }
    
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: price < 1 ? 6 : 2
    });
  };

  const getChartOption = (symbol: string, data: KLineData[]): EChartsOption => {
    return {
      grid: [
        {
          left: '4%',
          right: '4%',
          top: '4%',
          height: '60%'
        },
        {
          left: '4%',
          right: '4%',
          top: '75%',
          height: '20%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: data.map(item => item.time),
          gridIndex: 0,
          show: true,
          axisLabel: {
            show: false
          },
          axisTick: { 
            show: false  // 隐藏刻度线
          },
          axisLine: { 
            show: true,  // 显示轴线
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        {
          type: 'category',
          data: data.map(item => item.time),
          gridIndex: 1,
          show: false
        }
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true
          },
          gridIndex: 0,
          show: false,
          axisLabel: {
            formatter: (value: number) => formatPrice(value, symbol)
          }
        },
        {
          scale: true,
          gridIndex: 1,
          show: false
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: data.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]),
          itemStyle: {
            color: '#26a69a',
            color0: '#ef5350',
            borderColor: '#26a69a',
            borderColor0: '#ef5350'
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: data.map(item => [
            item.time,
            item.volume
          ]),
          itemStyle: {
            color: (params: ItemStyleParams) => {
              const item = data[params.dataIndex];
              return item.close >= item.open ? '#26a69a' : '#ef5350';
            }
          }
        }
      ]
    };
  };

  // 添加事件处理函数的类型
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSymbol(e.target.value.toUpperCase());
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 使用 useMemo 优化计算密集型操作
  const getMinMaxPrice = useCallback((data: KLineData[]) => {
    const lows = data.map(d => d.low);
    const highs = data.map(d => d.high);
    return {
      min: Math.min(...lows),
      max: Math.max(...highs),
      close: data[data.length - 1].close
    };
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-emerald-200/70 via-green-300/60 to-teal-400/70 p-3 relative">
        <div className="absolute top-3 left-3 right-3 flex items-center gap-4">
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

          <div className="h-9 flex items-center gap-3 px-4 rounded-lg bg-white/90 shadow-lg">
            <h2 className="text-gray-800 font-medium">加密货币行情</h2>
            {lastUpdateTime && (
              <span className="text-sm text-gray-500">
                更新于: {lastUpdateTime}
              </span>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300"
            >
              管理货币
            </button>
            <button
              onClick={fetchKlineData}
              disabled={isLoading}
              className="h-7 px-3 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? '加载中...' : '刷新数据'}
            </button>
          </div>
        </div>

        <div className="mx-[100px] pt-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {symbols.map(symbol => (
              <div key={symbol} className="bg-white/90 rounded-lg p-2 shadow-lg">
                {loadingStates[symbol] ? (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    {symbol} 加载中...
                  </div>
                ) : klineData[symbol]?.length > 0 ? (
                  <>
                    <div className="mb-1 flex flex-wrap items-center gap-x-3 px-1">
                      <span className="text-base font-bold text-blue-400">{symbol}</span>
                      <span className="text-sm text-blue-400 whitespace-nowrap">
                        Close: {formatPrice(klineData[symbol][klineData[symbol].length - 1].close, symbol)}
                      </span>
                      <span className="text-sm text-red-500 whitespace-nowrap">
                        Min: {formatPrice(Math.min(...klineData[symbol].map(d => d.low)), symbol)}
                      </span>
                      <span className="text-sm text-green-500 whitespace-nowrap">
                        Max: {formatPrice(Math.max(...klineData[symbol].map(d => d.high)), symbol)}
                      </span>
                    </div>
                    <ReactECharts 
                      option={getChartOption(symbol, klineData[symbol])} 
                      style={{ height: '220px' }}
                      className="w-full"
                    />
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    {symbol} 未获取数据
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 管理货币弹窗 */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl"
              onClick={handleModalClick}
            >
              <h3 className="text-xl font-medium text-gray-800 mb-4">管理货币表</h3>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={handleInputChange}
                  placeholder="输入货币符号（如 BTC）"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  onClick={handleAddSymbol}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  添加
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {symbols.map((symbol, index) => (
                  <div 
                    key={symbol}
                    className="flex items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="w-8 text-gray-400 select-none">
                      {index + 1}.
                    </span>
                    <span className="flex-1">{symbol}</span>
                    <button
                      onClick={() => handleRemoveSymbol(symbol)}
                      className="text-red-500 hover:text-red-600 ml-2"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
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