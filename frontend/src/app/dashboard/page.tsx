'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign,
  Users, ArrowUpRight, ArrowDownRight, CreditCard, Clock,
  Wallet, Smartphone, Building, Banknote, Star, ChevronRight,
  BarChart3, Receipt, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface DashboardData {
  todaySales: number;
  todayDiscount: number;
  todayTax: number;
  todayTransactions: number;
  avgTransaction: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
  totalCustomers: number;
  monthSales: number;
  monthTransactions: number;
  topProducts: { id: number; name: string; category?: { name: string }; quantitySold: number; totalRevenue: number }[];
  recentSales: any[];
  salesChart: { date: string; total: number; count: number }[];
  revenueTrend: { date: string; total: number }[];
  paymentBreakdown: { method: string; amount: number; color: string }[];
}

// ── Axpos Design System ─────────────────────────────────────
// Primary brand:  teal-500  (#14b8a6)  — vibrant, modern
// Accent:         emerald-500 (#10b981) — complementary green
// Dark surfaces:  zinc-900  (#18181b)  — deep charcoal, no purple
// Semantic:       emerald-500 (positive), amber-500 (warning), red-500 (danger)
// Neutral:        zinc-500 (secondary text), zinc-900 (headings)
// ─────────────────────────────────────────────────────────────

const BRAND_TEAL    = '#14b8a6';
const BRAND_EMERALD = '#10b981';
const SEMANTIC_GREEN  = '#059669';
const SEMANTIC_AMBER  = '#d97706';
const SEMANTIC_RED    = '#ef4444';

const PAYMENT_COLORS = ['#14b8a6', '#10b981', '#34d399', '#6ee7b7'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-zinc-100 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-zinc-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-zinc-100 rounded-2xl" />
          <div className="h-80 bg-zinc-100 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!data) return null;

  const totalPaymentAmount = data.paymentBreakdown.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* ── Welcome Banner ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(20,184,166,0.12),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/8 to-emerald-500/8 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">{greeting}</p>
            <h1 className="text-3xl font-bold mb-2 text-white">Dashboard Overview</h1>
            <p className="text-zinc-200 text-sm max-w-md">
              Track your store performance, monitor inventory levels, and stay on top of sales in real time.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => window.location.href = '/pos'}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all text-white shadow-lg shadow-teal-500/25">
                <Plus size={16} /> New Sale
              </button>
              <button onClick={() => window.location.href = '/reports'}
                className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-zinc-600 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500">
                <BarChart3 size={16} /> View Reports
              </button>
            </div>
          </div>
          <div className="hidden lg:flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{formatCurrency(data.monthSales)}</div>
              <div className="text-zinc-400 text-xs mt-1">Monthly Revenue</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{data.monthTransactions}</div>
              <div className="text-zinc-400 text-xs mt-1">Monthly Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: formatCurrency(data.todaySales),
            sub: `${data.todayTransactions} transactions`,
            icon: DollarSign,
            trend: data.todaySales > 0 ? 'up' : 'neutral',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Avg. Transaction',
            value: formatCurrency(data.avgTransaction),
            sub: `Tax: ${formatCurrency(data.todayTax)}`,
            icon: Receipt,
            trend: 'up',
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
          },
          {
            label: 'Active Products',
            value: data.totalProducts,
            sub: `${data.lowStockCount} low stock · ${data.outOfStockCount} out`,
            icon: Package,
            trend: data.lowStockCount > 0 ? 'down' : 'neutral',
            iconBg: data.lowStockCount > 0 ? 'bg-amber-50' : 'bg-teal-50',
            iconColor: data.lowStockCount > 0 ? 'text-amber-500' : 'text-teal-600',
          },
          {
            label: 'Customers',
            value: data.totalCustomers,
            sub: `${data.expiringCount} products expiring soon`,
            icon: Users,
            trend: data.expiringCount > 0 ? 'down' : 'neutral',
            iconBg: data.expiringCount > 0 ? 'bg-amber-50' : 'bg-teal-50',
            iconColor: data.expiringCount > 0 ? 'text-amber-500' : 'text-teal-600',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          const isWarning = card.label === 'Active Products' && data.lowStockCount > 0;
          const isExpiring = card.label === 'Customers' && data.expiringCount > 0;
          const subColor = isWarning || isExpiring
            ? 'text-amber-600 font-medium'
            : 'text-zinc-500';

          // Arrow color: green only for revenue/transactions, amber for warnings, neutral gray otherwise
          const arrowColor = card.trend === 'up'
            ? 'text-emerald-500'
            : card.trend === 'down'
              ? 'text-amber-500'
              : 'text-zinc-300';

          return (
            <div key={i}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 hover:shadow-lg hover:border-teal-100 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">{card.label}</span>
                <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
              </div>
              <div className="text-2xl font-bold text-zinc-900 mb-1">{card.value}</div>
              <div className="flex items-center gap-1.5">
                {card.trend !== 'neutral' && (
                  card.trend === 'up'
                    ? <ArrowUpRight size={14} className={arrowColor} />
                    : <ArrowDownRight size={14} className={arrowColor} />
                )}
                <span className={`text-xs ${subColor}`}>{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-zinc-900">Revenue Trend</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock size={14} /> Updated just now
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_TEAL} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={BRAND_TEAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a1a1aa' }} tickFormatter={v => {
                const d = new Date(v);
                return d.toLocaleDateString('en', { weekday: 'short' });
              }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                labelFormatter={l => new Date(l).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="total" stroke={BRAND_TEAL} strokeWidth={2.5}
                fill="url(#revenueGradient)" dot={{ r: 4, fill: BRAND_TEAL, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: BRAND_TEAL, strokeWidth: 3, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
          <h3 className="font-semibold text-zinc-900 mb-2">Payment Methods</h3>
          <p className="text-xs text-zinc-500 mb-4">Last 30 days</p>
          {totalPaymentAmount > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.paymentBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="amount" stroke="none">
                    {data.paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.paymentBreakdown.map((p, i) => {
                  const pct = totalPaymentAmount > 0 ? (p.amount / totalPaymentAmount * 100).toFixed(0) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i] }} />
                        <span className="text-zinc-600">{p.method}</span>
                      </div>
                      <span className="text-zinc-400 text-xs">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full mt-6">
        {/* Top Products Card */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Top Products</h3>
              <span className="text-xs text-slate-400">30 days</span>
            </div>
            {data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((p, i) => {
                  const maxQty = data.topProducts[0]?.quantitySold || 1;
                  const barWidth = (p.quantitySold / maxQty) * 100;
                  return (
                    <div key={p.id} className="flex flex-col pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-100">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.category?.name || 'Uncategorized'} • <span className="text-slate-500">{p.quantitySold} sold</span></p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800">{formatCurrency(p.totalRevenue)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${barWidth}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No sales data yet</div>
            )}
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 lg:col-span-2 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Recent Transactions</h3>
              <p className="text-xs text-slate-400">Latest 8 sales</p>
            </div>
            <button onClick={() => window.location.href = '/reports'}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <span>→</span>
            </button>
          </div>

          {data.recentSales.length > 0 ? (
            <div className="w-full overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="w-[22%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">Invoice</th>
                    <th className="w-[15%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">Cashier</th>
                    <th className="w-[15%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">Customer</th>
                    <th className="w-[10%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase text-center">Items</th>
                    <th className="w-[18%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">Payment</th>
                    <th className="w-[12%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">Total</th>
                    <th className="w-[13%] pb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentSales.map((sale: any) => {
                    const paymentMethods = sale.payments?.map((p: any) => p.method).join(', ') || '—';
                    const itemCount = sale.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-3.5">
                          <p className="text-sm font-medium text-slate-700 group-hover:text-teal-600 transition-colors">{sale.invoiceNo}</p>
                          <p className="text-[11px] text-slate-400">{formatDateTime(sale.createdAt)}</p>
                        </td>
                        <td className="py-3.5 text-sm text-slate-600">{sale.cashier?.name || '—'}</td>
                        <td className="py-3.5 text-sm text-slate-600">{sale.customer?.name || 'Walk-in'}</td>
                        <td className="py-3.5 text-center">
                          <span className="inline-flex items-center justify-center bg-slate-50 text-slate-600 text-xs font-medium w-6 h-6 rounded-full border border-slate-100">
                            {itemCount}
                          </span>
                        </td>
                        <td className="py-3.5 text-sm text-slate-600 truncate">{paymentMethods.replace(/_/g, ' ')}</td>
                        <td className="py-3.5 text-sm font-bold text-slate-800">{formatCurrency(sale.grandTotal)}</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            sale.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' :
                            sale.status === 'suspended' ? 'bg-amber-50 text-amber-700 border-amber-100/50' :
                            'bg-red-50 text-red-700 border-red-100/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              sale.status === 'completed' ? 'bg-emerald-500' :
                              sale.status === 'suspended' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Receipt size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
