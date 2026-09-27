'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { registerChartJS } from './setup';

registerChartJS();

export interface DoughnutChartProps {
  labels: string[];
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  title?: string;
  subtitle?: string;
  centerText?: {
    value: string | number;
    label: string;
  };
  height?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#8b5cf6', // purple
];

export default function DoughnutChart({
  labels,
  data,
  backgroundColor = DEFAULT_COLORS,
  borderColor,
  title,
  subtitle,
  centerText,
  height = 260,
  className = '',
}: DoughnutChartProps) {
  const total = data.reduce((a, b) => a + b, 0);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 11, weight: 600, family: 'inherit' },
          color: '#888888',
          generateLabels: (chart) => {
            const chartData = chart.data;
            if (chartData.labels && chartData.datasets.length) {
              return chartData.labels.map((label, i) => {
                const val = (chartData.datasets[0].data[i] as number) || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(0) : '0';
                const bg = Array.isArray(chartData.datasets[0].backgroundColor)
                  ? (chartData.datasets[0].backgroundColor[i] as string)
                  : '#6366f1';

                return {
                  text: `${label} (${val} • ${pct}%)`,
                  fillStyle: bg,
                  strokeStyle: bg,
                  lineWidth: 0,
                  hidden: false,
                  index: i,
                  pointStyle: 'circle',
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${val.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: borderColor || 'transparent',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div
      className={`bg-white dark:bg-[#161922] p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs transition-colors ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          {title && (
            <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      <div style={{ height: `${height}px` }} className="w-full relative flex items-center justify-center">
        <Doughnut data={chartData} options={options} />

        {centerText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-32 sm:pr-40">
            <span className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white leading-none">
              {centerText.value}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 mt-1 max-w-[80px] text-center truncate">
              {centerText.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
