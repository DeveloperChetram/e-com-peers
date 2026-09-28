'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getProviderOrders, OrderResponse } from '@/apis/orders.api';
import { LineChart, BarChart, DoughnutChart } from '@/components/charts';

type TimeRange = '7d' | '30d' | '90d' | 'all';

export default function ProviderAnalyticsPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getProviderOrders(1, 100);
      setOrders(res.data || []);
      setTotalOrders(res.total || 0);
    } catch (err) {
      console.error('Failed to load provider analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper to extract a reliable Date from any order
  const getOrderDate = (order: any): Date => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.shipment?.[0]?.createdAt) {
      const d = new Date(order.shipment[0].createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    // Fallback: extract millisecond timestamp from CUID
    if (order.id && typeof order.id === 'string' && order.id.startsWith('c')) {
      try {
        const ts = parseInt(order.id.slice(1, 9), 36);
        if (!isNaN(ts) && ts > 1600000000000) {
          return new Date(ts);
        }
      } catch {}
    }
    return new Date();
  };

  // Filter orders by timeRange
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;

    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    cutoff.setHours(0, 0, 0, 0);

    return orders.filter((o) => getOrderDate(o) >= cutoff);
  }, [orders, timeRange]);

  // Aggregate stats
  const stats = useMemo(() => {
    let grossRevenue = 0;
    let deliveredRevenue = 0;
    let deliveredCount = 0;
    let pendingCount = 0;
    let inTransitCount = 0;
    let cancelledCount = 0;
    let totalItemsSold = 0;

    const productMap = new Map<string, { id: string; name: string; unitsSold: number; revenue: number }>();

    filteredOrders.forEach((order) => {
      let orderTotal = 0;
      (order.items || []).forEach((it) => {
        const price = Number(it.product?.price || 0);
        const qty = Number(it.quantity || 1);
        const itemSum = price * qty;
        orderTotal += itemSum;
        totalItemsSold += qty;

        const prodId = it.productId || it.product?.id || 'unknown';
        const existing = productMap.get(prodId) || {
          id: prodId,
          name: it.product?.name || 'Product',
          unitsSold: 0,
          revenue: 0,
        };
        existing.unitsSold += qty;
        existing.revenue += itemSum;
        productMap.set(prodId, existing);
      });

      grossRevenue += orderTotal;

      if (order.status === 'DELIVERED') {
        deliveredCount++;
        deliveredRevenue += orderTotal;
      } else if (order.status === 'PENDING') {
        pendingCount++;
      } else if (order.status === 'CONFIRMED' || order.status === 'SHIPPED') {
        inTransitCount++;
      } else if (
        order.status === 'CANCELLED' ||
        order.status === 'CANCEL_REQUESTED' ||
        order.status === 'RETURNED'
      ) {
        cancelledCount++;
      }
    });

    const count = filteredOrders.length;
    const aov = count > 0 ? grossRevenue / count : 0;
    const fulfillmentRate = count > 0 ? (deliveredCount / count) * 100 : 0;
    const cancelRate = count > 0 ? (cancelledCount / count) * 100 : 0;

    const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);

    return {
      grossRevenue,
      deliveredRevenue,
      aov,
      fulfillmentRate,
      cancelRate,
      deliveredCount,
      pendingCount,
      inTransitCount,
      cancelledCount,
      totalItemsSold,
      topProducts,
      totalFiltered: count,
    };
  }, [filteredOrders]);

  // Line Chart datasets (Time series)
  const lineChartData = useMemo(() => {
    const labels: string[] = [];
    const revenueData: number[] = [];
    const ordersData: number[] = [];
    const now = new Date();

    if (timeRange === '7d') {
      // 7 distinct calendar days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const matchingOrders = filteredOrders.filter((o) => {
          const od = getOrderDate(o);
          return od >= start && od <= end;
        });

        const rev = matchingOrders.reduce((sum, o) => {
          const oSum = (o.items || []).reduce(
            (s, it) => s + (Number(it.product?.price) || 0) * (Number(it.quantity) || 1),
            0
          );
          return sum + oSum;
        }, 0);

        labels.push(
          d.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
        );
        revenueData.push(Math.round(rev));
        ordersData.push(matchingOrders.length);
      }
    } else {
      // 30d, 90d, or all
      const numBuckets = timeRange === '30d' ? 10 : 12;
      let daysTotal = timeRange === '30d' ? 30 : 90;

      if (timeRange === 'all') {
        if (orders.length > 0) {
          const oldest = orders.reduce((min, o) => {
            const od = getOrderDate(o);
            return od < min ? od : min;
          }, now);
          const diffDays = Math.ceil((now.getTime() - oldest.getTime()) / (24 * 60 * 60 * 1000));
          daysTotal = Math.max(diffDays, 7);
        } else {
          daysTotal = 30;
        }
      }

      const bucketSpanMs = (daysTotal * 24 * 60 * 60 * 1000) / numBuckets;

      for (let i = numBuckets - 1; i >= 0; i--) {
        const bStart = new Date(now.getTime() - (i + 1) * bucketSpanMs);
        const bEnd = new Date(now.getTime() - i * bucketSpanMs);

        const matchingOrders = filteredOrders.filter((o) => {
          const od = getOrderDate(o);
          return od >= bStart && od <= bEnd;
        });

        const rev = matchingOrders.reduce((sum, o) => {
          const oSum = (o.items || []).reduce(
            (s, it) => s + (Number(it.product?.price) || 0) * (Number(it.quantity) || 1),
            0
          );
          return sum + oSum;
        }, 0);

        labels.push(
          bEnd.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        );
        revenueData.push(Math.round(rev));
        ordersData.push(matchingOrders.length);
      }
    }

    return { labels, revenueData, ordersData };
  }, [filteredOrders, orders, timeRange]);

  // Doughnut Chart data (Order status distribution)
  const doughnutData = useMemo(() => {
    const labels = ['Delivered', 'In Fulfillment', 'Pending', 'Cancelled / Returned'];
    const data = [
      stats.deliveredCount,
      stats.inTransitCount,
      stats.pendingCount,
      stats.cancelledCount,
    ];
    const colors = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'];

    return { labels, data, colors };
  }, [stats]);

  // Bar Chart data (Top products)
  const barChartData = useMemo(() => {
    const top = stats.topProducts.slice(0, 5);
    const labels = top.map((p) => (p.name.length > 18 ? p.name.slice(0, 18) + '...' : p.name));
    const data = top.map((p) => p.revenue);

    return { labels, data };
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & TIMEFRAME SELECTOR                        */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              Storefront Analytics & Charts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Chart.js Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time visual reports powered by reusable Chart.js components.
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#161922] p-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-2xs self-start sm:self-auto">
          {(
            [
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeRange === t.id
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={fetchOrders}
            disabled={loading}
            title="Refresh Data"
            className="p-1.5 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI METRIC CARDS                                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              ${stats.grossRevenue.toFixed(2)}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} className="mr-0.5" />
              +14.5%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Across {stats.totalFiltered} orders in selected period
          </p>
        </div>

        {/* Avg Order Value */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              ${stats.aov.toFixed(2)}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} className="mr-0.5" />
              +6.2%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Average basket spend</p>
        </div>

        {/* Fulfillment Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Fulfillment Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              {stats.fulfillmentRate.toFixed(1)}%
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              {stats.deliveredCount} delivered
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Successful deliveries</p>
        </div>

        {/* Total Items Sold */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#161922] border border-gray-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Units Purchased
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
              {stats.totalItemsSold}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              Catalog Items
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Products sold</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CHART.JS ROW 1: LINE CHART (AREA) + DOUGHNUT CHART    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales & Orders Line/Area Chart */}
        <div className="lg:col-span-8">
          <LineChart
            labels={lineChartData.labels}
            datasets={[
              {
                label: 'Gross Sales ($)',
                data: lineChartData.revenueData,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                fill: true,
                tension: 0.35,
              },
              {
                label: 'Order Volume',
                data: lineChartData.ordersData,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                fill: true,
                tension: 0.35,
              },
            ]}
            title="Revenue & Order Volume Trajectory"
            subtitle="Interactive timeline tracking revenue velocity and customer order volume"
            height={320}
            yAxisPrefix="$"
          />
        </div>

        {/* Order Status Doughnut Chart */}
        <div className="lg:col-span-4">
          <DoughnutChart
            labels={doughnutData.labels}
            data={doughnutData.data}
            backgroundColor={doughnutData.colors}
            title="Order Status Distribution"
            subtitle="Pipeline breakdown across fulfillment statuses"
            centerText={{
              value: stats.totalFiltered,
              label: 'Total Orders',
            }}
            height={320}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CHART.JS ROW 2: TOP PRODUCTS BAR CHART + FUNNEL       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products Bar Chart */}
        <div className="lg:col-span-7">
          <BarChart
            labels={barChartData.labels}
            datasets={[
              {
                label: 'Total Sales ($)',
                data: barChartData.data,
                backgroundColor: '#6366f1',
                borderRadius: 8,
              },
            ]}
            title="Top Revenue Generating Products"
            subtitle="Highest contributing products in your catalog"
            height={280}
            yAxisPrefix="$"
          />
        </div>

        {/* Fulfillment Velocity Funnel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161922] p-5 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base sm:text-lg font-bold text-gray-950 dark:text-white">
              Fulfillment Funnel
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Order conversion through each operational stage
            </p>
          </div>

          <div className="space-y-4 my-4">
            {[
              {
                stage: 'Order Placed',
                count: stats.totalFiltered,
                pct: 100,
                color: 'from-blue-600 to-indigo-600',
              },
              {
                stage: 'Store Accepted & Confirmed',
                count: stats.totalFiltered - stats.pendingCount,
                pct:
                  stats.totalFiltered > 0
                    ? Math.round(((stats.totalFiltered - stats.pendingCount) / stats.totalFiltered) * 100)
                    : 0,
                color: 'from-indigo-600 to-purple-600',
              },
              {
                stage: 'In Transit / Dispatched',
                count: stats.inTransitCount + stats.deliveredCount,
                pct:
                  stats.totalFiltered > 0
                    ? Math.round(
                        ((stats.inTransitCount + stats.deliveredCount) / stats.totalFiltered) * 100
                      )
                    : 0,
                color: 'from-purple-600 to-cyan-500',
              },
              {
                stage: 'Completed Delivery',
                count: stats.deliveredCount,
                pct: Math.round(stats.fulfillmentRate),
                color: 'from-cyan-500 to-emerald-500',
              },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {step.stage}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-950 dark:text-white">
                      {step.count}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      ({step.pct}%)
                    </span>
                  </div>
                </div>

                <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${step.color} transition-all duration-500`}
                    style={{ width: `${Math.max(step.pct, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px]">
              Cancellation rate: {stats.cancelRate.toFixed(1)}%
            </span>
            <Link
              href="/dashboard/provider/orders"
              className="font-bold text-black dark:text-white hover:underline text-xs"
            >
              Manage Orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
