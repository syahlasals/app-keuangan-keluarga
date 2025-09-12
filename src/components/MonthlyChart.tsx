'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/utils/helpers';
import type { ChartData } from '@/types';

interface MonthlyChartProps {
  data: ChartData[];
  type?: 'line' | 'bar';
}

export default function MonthlyChart({ data, type = 'line' }: MonthlyChartProps) {
  const formatTooltip = (value: number, name: string) => {
    const label = name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';
    return [formatCurrency(value), label];
  };

  const formatXAxisLabel = (value: string) => {
    const date = new Date(value);
    return date.getDate().toString();
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={formatTooltip}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long'
              });
            }}
          />

          {type === 'line' ? (
            <>
              <Line
                type="monotone"
                dataKey="pemasukan"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#22c55e', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
              />
            </>
          ) : (
            <>
              <Bar dataKey="pemasukan" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}