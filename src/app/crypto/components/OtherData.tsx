'use client';

import type { MarketMetrics } from '@/types/crypto';

interface OtherDataProps {
  metrics: MarketMetrics | null;
}

export default function OtherData({ metrics }: OtherDataProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 恐慌贪婪指数 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
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
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
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
        <div className="bg-white/90 rounded-lg p-6 shadow-lg">
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

        {/* 空白占位 */}
        <div className="hidden lg:block"></div>

        {/* DeFi 协议 TVL */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>🏦</span>
            DeFi 协议 TVL 排名
          </h3>
          {metrics?.defiProtocols ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 链 TVL */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>⛓️</span>
            链 TVL 排名
          </h3>
          {metrics?.defiChains ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 稳定币流通量 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>💵</span>
            稳定币流通量排名
          </h3>
          {metrics?.stablecoins ? (
            <div className="overflow-x-auto">
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
                  {metrics.stablecoins.stablecoins.map((coin, index) => (
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 链上稳定币市值 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>🔗</span>
            链上稳定币市值排名
          </h3>
          {metrics?.chainStables ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="pb-2">排名</th>
                    <th className="pb-2">链</th>
                    <th className="pb-2 text-right">稳定币总市值</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.chainStables.chainStables.map((chain, index) => (
                    <tr key={chain.name} className="border-b last:border-0">
                      <td className="py-2 text-gray-500">{index + 1}</td>
                      <td className="py-2 font-medium">{chain.name}</td>
                      <td className="py-2 text-right">${chain.totalCirculating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 收益率排名 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>📈</span>
            收益率排名
          </h3>
          {metrics?.yields ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 交易量排名 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>💹</span>
            交易量排名
          </h3>
          {metrics?.volumes ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>

        {/* 费用收入排名 */}
        <div className="bg-white/90 rounded-lg p-6 shadow-lg lg:col-span-3">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span>💰</span>
            费用收入排名
          </h3>
          {metrics?.fees ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-gray-500 text-center">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}