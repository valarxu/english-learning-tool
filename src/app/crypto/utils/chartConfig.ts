import type { KLineData } from '@/types/crypto';
import type { EChartsOption } from 'echarts';
import { formatPrice } from './formatters';

export const getChartOption = (symbol: string, data: KLineData[]): EChartsOption => {
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
          show: false
        },
        axisLine: { 
          show: true,
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
          formatter: (value: number) => formatPrice(value)
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
          color: (params: { dataIndex: number }) => {
            const item = data[params.dataIndex];
            return item.close >= item.open ? '#26a69a' : '#ef5350';
          }
        }
      }
    ]
  };
}; 