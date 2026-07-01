'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ShoppingCart, Package, AlertTriangle, DollarSign, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardData {
  todaySales: number;
  todayTransactions: number;
  totalProducts: number;
  lowStockCount: number;
  topProducts: { id: number; name: string; quantitySold: number; totalRevenue: number }[];
  recentSales: any[];
  salesChart: { date: string; total: number; count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!data) return null;

  const cards = [
    { label: "Today's Sales", value: formatCurrency(data.todaySales), icon: DollarSign, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { label: 'Transactions', value: data.todayTransactions, icon: ShoppingCart, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Products in Stock', value: data.totalProducts, icon: Package, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
    { label: 'Low Stock Alerts', value: data.lowStockCount, icon: AlertTriangle, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}><Icon size={20} className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} /></div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Sales Overview (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {data.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-bold text-blue-600">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.quantitySold} sold</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 font-medium">Invoice</th>
                <th className="pb-3 font-medium">Cashier</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium text-right">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSales.map((sale: any) => (
                <tr key={sale.id} className="border-b border-gray-50">
                  <td className="py-3 font-mono text-xs">{sale.invoiceNo}</td>
                  <td className="py-3">{sale.cashier?.name || '-'}</td>
                  <td className="py-3">{sale.customer?.name || 'Walk-in'}</td>
                  <td className="py-3">{sale.items?.length || 0}</td>
                  <td className="py-3 text-right font-semibold">{formatCurrency(sale.grandTotal)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                      sale.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>{sale.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
