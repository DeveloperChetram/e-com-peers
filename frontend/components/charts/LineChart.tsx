'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { registerChartJS } from './setup';

registerChartJS();

export interface LineChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
  borderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string;
}

export interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  title?: string;
  subtitle?: string;
  height?: number;
  showGrid?: boolean;
  yAxisPrefix?: string;
  yAxisSuffix?: string;
  className?: string;
}

export default function LineChart({
  labels,
  datasets,
  title,
  subtitle,
  height = 300,
  showGrid = true,
  yAxisPrefix = '',
  yAxisSuffix = '',
  className = '',
}: LineChartProps) {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
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
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            return ` ${context.dataset.label || 'Value'}: ${yAxisPrefix}${Number(val ?? 0).toLocaleString()}${yAxisSuffix}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#94a3b8',
          maxRotation: 0,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: showGrid,
          color: 'rgba(148, 163, 184, 0.12)',
        },
        ticks: {
          font: { size: 11, family: 'inherit' },
          color: '#94a3b8',
          callback: (value) => `${yAxisPrefix}${Number(value).toLocaleString()}${yAxisSuffix}`,
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
      fill: ds.fill ?? true,
      tension: ds.tension ?? 0.38,
      borderWidth: ds.borderWidth ?? 2.5,
      borderColor: ds.borderColor || '#8b5cf6',
      backgroundColor: ds.backgroundColor || 'rgba(139, 92, 246, 0.08)',
      pointRadius: ds.pointRadius ?? 3,
      pointHoverRadius: ds.pointHoverRadius ?? 6,
      pointBackgroundColor: ds.pointBackgroundColor || ds.borderColor || '#8b5cf6',
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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
