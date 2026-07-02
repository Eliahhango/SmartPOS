'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign,
  Users, ArrowUpRight, ArrowDownRight, CreditCard, Clock,
  Wallet, Smartphone, Building, Banknote, Star, ChevronRight,
  BarChart3, Receipt, Plus, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
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

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

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
        <div className="h-40 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-gray-200 rounded-2xl" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (!data) return null;

  const totalPaymentAmount = data.paymentBreakdown.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#090727] via-[#0f0b3d] to-[#1a1050] p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">{greeting}</p>
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-white/50 text-sm max-w-md">
              Track your store performance, monitor inventory levels, and stay on top of sales in real time.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => window.location.href = '/pos'} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
                <Plus size={16} /> New Sale
              </button>
              <button onClick={() => window.location.href = '/reports'} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-white/10">
                <BarChart3 size={16} /> View Reports
              </button>
            </div>
          </div>
          <div className="hidden lg:flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(data.monthSales)}</div>
              <div className="text-white/50 text-xs mt-1">Monthly Revenue</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold">{data.monthTransactions}</div>
              <div className="text-white/50 text-xs mt-1">Monthly Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: formatCurrency(data.todaySales),
            sub: `${data.todayTransactions} transactions`,
            icon: DollarSign,
            trend: data.todaySales > 0 ? 'up' : 'neutral',
            gradient: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50',
            textColor: 'text-emerald-600'
          },
          {
            label: 'Avg. Transaction',
            value: formatCurrency(data.avgTransaction),
            sub: `Tax: ${formatCurrency(data.todayTax)}`,
            icon: Receipt,
            trend: 'up',
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            label: 'Active Products',
            value: data.totalProducts,
            sub: `${data.lowStockCount} low stock · ${data.outOfStockCount} out`,
            icon: Package,
            trend: data.lowStockCount > 5 ? 'down' : 'up',
            gradient: 'from-violet-500 to-purple-500',
            bg: 'bg-violet-50',
            textColor: 'text-violet-600'
          },
          {
            label: 'Customers',
            value: data.totalCustomers,
            sub: `${data.expiringCount} products expiring soon`,
            icon: Users,
            trend: 'up',
            gradient: 'from-orange-500 to-amber-500',
            bg: 'bg-orange-50',
            textColor: 'text-orange-600'
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <div className={`p-2.5 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} className={card.textColor} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="flex items-center gap-1.5">
                {card.trend === 'up' ? <ArrowUpRight size={14} className="text-emerald-500" /> :
                 card.trend === 'down' ? <ArrowDownRight size={14} className="text-red-500" /> : null}
                <span className="text-xs text-gray-400">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={14} /> Updated just now
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => {
                const d = new Date(v);
                return d.toLocaleDateString('en', { weekday: 'short' });
              }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                labelFormatter={l => new Date(l).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#revenueGradient)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Methods</h3>
          <p className="text-xs text-gray-400 mb-4">Last 30 days</p>
          {totalPaymentAmount > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.paymentBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="amount" stroke="none">
                    {data.paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.paymentBreakdown.map((p, i) => {
                  const icons: any = { Cash: Banknote, 'Mobile Money': Smartphone, Card: CreditCard, Bank: Building };
                  const Icon = icons[p.method] || Wallet;
                  const pct = totalPaymentAmount > 0 ? (p.amount / totalPaymentAmount * 100).toFixed(0) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-gray-600">{p.method}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No payment data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
            <span className="text-xs text-gray-400">30 days</span>
          </div>
          {data.topProducts.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((p, i) => {
                const maxQty = data.topProducts[0]?.quantitySold || 1;
                const barWidth = (p.quantitySold / maxQty) * 100;
                return (
                  <div key={p.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' :
                          i === 1 ? 'bg-gray-100 text-gray-500' :
                          i === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-50 text-gray-400'
                        }`}>{i + 1}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 ml-2 shrink-0">{formatCurrency(p.totalRevenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{p.quantitySold} units sold</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest 8 sales</p>
            </div>
            <button onClick={() => window.location.href = '/reports'}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ChevronRight size={16} />
            </button>
          </div>
          {data.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-medium">Invoice</th>
                    <th className="pb-3 font-medium">Cashier</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium text-center">Items</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSales.map((sale: any) => {
                    const paymentMethods = sale.payments?.map((p: any) => p.method).join(', ') || '—';
                    const itemCount = sale.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
                    return (
                      <tr key={sale.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3">
                          <span className="font-mono text-xs font-medium text-gray-700">{sale.invoiceNo}</span>
                          <p className="text-xs text-gray-400">{formatDateTime(sale.createdAt)}</p>
                        </td>
                        <td className="py-3 text-gray-600">{sale.cashier?.name || '—'}</td>
                        <td className="py-3 text-gray-600">{sale.customer?.name || 'Walk-in'}</td>
                        <td className="py-3 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{itemCount}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-xs text-gray-500 capitalize">{paymentMethods.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(sale.grandTotal)}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            sale.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            sale.status === 'suspended' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
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
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Receipt size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
