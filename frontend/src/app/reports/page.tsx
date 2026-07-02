'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, AlertTriangle, Clock } from 'lucide-react';

export default function ReportsPage() {
  const [tab, setTab] = useState<'sales' | 'inventory' | 'financial' | 'cashier'>('sales');
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [cashierData, setCashierData] = useState<any[]>([]);
  const [period, setPeriod] = useState('daily');

  const fetchSales = async () => {
    const { data } = await api.get('/reports/sales', { params: { period } });
    setSalesData(data);
  };
  const fetchInventory = async () => {
    const { data } = await api.get('/reports/inventory');
    setInventoryData(data);
  };
  const fetchFinancial = async () => {
    const { data } = await api.get('/reports/financial');
    setFinancialData(data);
  };
  const fetchCashier = async () => {
    const { data } = await api.get('/reports/cashier');
    setCashierData(data);
  };

  useEffect(() => {
    if (tab === 'sales') fetchSales();
    if (tab === 'inventory') fetchInventory();
    if (tab === 'financial') fetchFinancial();
    if (tab === 'cashier') fetchCashier();
  }, [tab, period]);

  const CHART_COLORS = ['#14b8a6', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen w-full -m-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Analyze store revenue metrics and business growth charts</p>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
        {(['sales', 'inventory', 'financial', 'cashier'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
              tab === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Sales Tab */}
      {tab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Secondary Time Filter Pill Slider */}
          <div className="bg-slate-100 p-1 rounded-xl w-fit flex gap-1">
            {['daily', 'weekly', 'monthly', 'annual'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  period === p
                    ? 'bg-white border border-slate-200/40 text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 font-semibold'
                }`}>
                {p}
              </button>
            ))}
          </div>

          {/* Modern Stats Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Sales', value: formatCurrency(salesData.totalSales), icon: DollarSign },
              { label: 'Transactions', value: salesData.totalTransactions, icon: ShoppingCart },
              { label: 'Items Sold', value: salesData.totalItems, icon: TrendingUp },
              { label: 'Avg. Transaction', value: formatCurrency(salesData.averageTransaction), icon: Users },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{s.label}</span>
                    <span className="text-2xl font-extrabold text-slate-800 mt-1.5 block tracking-tight">{s.value}</span>
                  </div>
                  <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center text-sm border border-teal-100/30 shadow-sm">
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-6">
              <h3 className="font-bold text-slate-800 text-base">Sales Trend</h3>
              <span className="text-xs bg-slate-50 border border-slate-100 text-slate-400 font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Clock size={12} /> Live metrics
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.sales?.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="invoiceNo" tick={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                />
                <Bar dataKey="grandTotal" fill="url(#reportBarGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="reportBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {tab === 'inventory' && inventoryData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Products', value: inventoryData.totalProducts, icon: Package },
              { label: 'Low Stock', value: inventoryData.lowStock, icon: AlertTriangle, warn: true },
              { label: 'Out of Stock', value: inventoryData.outOfStock, icon: AlertTriangle, danger: true },
              { label: 'Expiring Soon', value: inventoryData.expiringSoon, icon: Clock, warn: true },
            ].map((s, i) => {
              const Icon = s.icon;
              const iconBg = s.danger ? 'bg-red-50 text-red-600 border-red-100/30' :
                             s.warn ? 'bg-amber-50 text-amber-600 border-amber-100/30' :
                             'bg-teal-50 text-teal-600 border-teal-100/30';
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{s.label}</span>
                    <span className="text-2xl font-extrabold text-slate-800 mt-1.5 block tracking-tight">{s.value}</span>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border shadow-sm ${iconBg}`}>
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-base mb-6">Stock Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: 'In Stock', value: inventoryData.totalProducts - inventoryData.outOfStock - inventoryData.lowStock },
                  { name: 'Low Stock', value: inventoryData.lowStock },
                  { name: 'Out of Stock', value: inventoryData.outOfStock },
                ]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {CHART_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {tab === 'financial' && financialData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Revenue', value: formatCurrency(financialData.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/30' },
              { label: 'Expenses', value: formatCurrency(financialData.expenses), icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50 border-red-100/30' },
              { label: 'Profit', value: formatCurrency(financialData.profit), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100/30' },
              { label: 'Tax Collected', value: formatCurrency(financialData.taxCollected), icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100/30' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{s.label}</span>
                    <span className={`text-2xl font-extrabold mt-1.5 block tracking-tight ${s.color}`}>{s.value}</span>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border shadow-sm ${s.bg} ${s.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cashier Tab */}
      {tab === 'cashier' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Cashier</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Total Sales</th>
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashierData.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800">{c.name}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 text-right">{c.totalSales}</td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">{formatCurrency(c.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
