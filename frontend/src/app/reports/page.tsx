'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

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

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="flex gap-2 flex-wrap">
        {(['sales', 'inventory', 'financial', 'cashier'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t}</button>
        ))}
      </div>

      {tab === 'sales' && salesData && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly', 'annual'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${period === p ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Sales', value: formatCurrency(salesData.totalSales), icon: DollarSign, color: 'text-green-600' },
              { label: 'Transactions', value: salesData.totalTransactions, icon: ShoppingCart, color: 'text-indigo-600' },
              { label: 'Items Sold', value: salesData.totalItems, icon: TrendingUp, color: 'text-violet-600' },
              { label: 'Avg. Transaction', value: formatCurrency(salesData.averageTransaction), icon: Users, color: 'text-orange-600' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Icon size={16} className={s.color} /> {s.label}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.sales?.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="invoiceNo" tick={false} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="grandTotal" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'inventory' && inventoryData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: inventoryData.totalProducts },
              { label: 'Low Stock', value: inventoryData.lowStock },
              { label: 'Out of Stock', value: inventoryData.outOfStock },
              { label: 'Expiring Soon', value: inventoryData.expiringSoon },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="text-sm text-gray-500 mb-1">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="font-semibold mb-4">Stock Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={[
                  { name: 'In Stock', value: inventoryData.totalProducts - inventoryData.outOfStock - inventoryData.lowStock },
                  { name: 'Low Stock', value: inventoryData.lowStock },
                  { name: 'Out of Stock', value: inventoryData.outOfStock },
                ]} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'financial' && financialData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Revenue', value: formatCurrency(financialData.revenue), color: 'text-green-600' },
              { label: 'Expenses', value: formatCurrency(financialData.expenses), color: 'text-red-600' },
              { label: 'Profit', value: formatCurrency(financialData.profit), color: 'text-indigo-600' },
              { label: 'Tax Collected', value: formatCurrency(financialData.taxCollected), color: 'text-violet-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="text-sm text-gray-500 mb-1">{s.label}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'cashier' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 bg-gray-50"><th className="p-4">Cashier</th><th className="p-4 text-right">Total Sales</th><th className="p-4 text-right">Total Amount</th></tr></thead>
            <tbody>
              {cashierData.map((c: any) => (
                <tr key={c.id} className="border-t border-gray-50">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4 text-right">{c.totalSales}</td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(c.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
