'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { registerChartJS } from './setup';

registerChartJS();

export interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  borderRadius?: number;
}

export interface BarChartProps {
  labels: string[];
  datasets: BarChartDataset[];
  title?: string;
  subtitle?: string;
  height?: number;
  horizontal?: boolean;
  yAxisPrefix?: string;
  yAxisSuffix?: string;
  className?: string;
}

export default function BarChart({
  labels,
  datasets,
  title,
  subtitle,
  height = 300,
  horizontal = false,
  yAxisPrefix = '',
  yAxisSuffix = '',
  className = '',
}: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          font: { size: 11, weight: 600, family: 'inherit' },
          color: '#888888',
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
            const val = horizontal ? context.parsed.x : context.parsed.y;
            return ` ${context.dataset.label || 'Value'}: ${yAxisPrefix}${Number(val ?? 0).toLocaleString()}${yAxisSuffix}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: horizontal,
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#94a3b8',
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: !horizontal,
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#94a3b8',
          callback: (value) =>
            horizontal
              ? value
              : `${yAxisPrefix}${Number(value).toLocaleString()}${yAxisSuffix}`,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      borderRadius: ds.borderRadius ?? 8,
      backgroundColor: ds.backgroundColor || '#6366f1',
      ...ds,
    })),
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
      <div style={{ height: `${height}px` }} className="w-full relative">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
