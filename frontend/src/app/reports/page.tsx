'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Building, CreditCard, Landmark, Wallet, Banknote, UserCheck, Store, Layers } from 'lucide-react';

const CHART_COLORS = ['#14b8a6', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#f59e0b', '#ef4444', '#8b5cf6'];
const INFLOW_ICONS: Record<string, any> = { cash: Banknote, mobile_money: Smartphone, card: CreditCard, bank: Landmark, credit: Wallet, customerPayments: UserCheck };

function Smartphone({ size }: { size?: number }) {
  return <svg width={size || 18} height={size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
}

export default function ReportsPage() {
  const [tab, setTab] = useState<'sales' | 'inventory' | 'financial' | 'cashier' | 'commission' | 'cash-flow' | 'dead-stock' | 'customers' | 'suppliers' | 'categories'>('sales');
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [cashierData, setCashierData] = useState<any[]>([]);
  const [commissionData, setCommissionData] = useState<any[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [deadStockData, setDeadStockData] = useState<any>(null);
  const [customerReportData, setCustomerReportData] = useState<any>(null);
  const [supplierReportData, setSupplierReportData] = useState<any>(null);
  const [categorySalesData, setCategorySalesData] = useState<any>(null);
  const [period, setPeriod] = useState('daily');
  const [cfStartDate, setCfStartDate] = useState('');
  const [cfEndDate, setCfEndDate] = useState('');
  const [cfPreset, setCfPreset] = useState('month');
  const [dsDays, setDsDays] = useState(90);
  const [crStartDate, setCrStartDate] = useState('');
  const [crEndDate, setCrEndDate] = useState('');
  const [srStartDate, setSrStartDate] = useState('');
  const [srEndDate, setSrEndDate] = useState('');
  const [csStartDate, setCsStartDate] = useState('');
  const [csEndDate, setCsEndDate] = useState('');

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
  const fetchCommission = async () => {
    const { data } = await api.get('/reports/commission');
    setCommissionData(data);
  };
  const fetchCashFlow = useCallback(async () => {
    const params: any = {};
    if (cfPreset === 'custom') {
      if (cfStartDate) params.startDate = cfStartDate;
      if (cfEndDate) params.endDate = cfEndDate;
    } else {
      const now = new Date();
      if (cfPreset === '7days') {
        const d = new Date(now); d.setDate(d.getDate() - 7);
        params.startDate = d.toISOString().split('T')[0];
        params.endDate = now.toISOString().split('T')[0];
      } else if (cfPreset === 'quarter') {
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        params.startDate = qStart.toISOString().split('T')[0];
        params.endDate = now.toISOString().split('T')[0];
      } else {
        params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        params.endDate = now.toISOString().split('T')[0];
      }
    }
    const { data } = await api.get('/reports/cash-flow', { params });
    setCashFlowData(data);
  }, [cfPreset, cfStartDate, cfEndDate]);
  const fetchDeadStock = useCallback(async () => {
    const { data } = await api.get('/reports/dead-stock', { params: { days: dsDays } });
    setDeadStockData(data);
  }, [dsDays]);
  const fetchCustomerReport = useCallback(async () => {
    const params: any = {};
    if (crStartDate) params.startDate = crStartDate;
    if (crEndDate) params.endDate = crEndDate;
    const { data } = await api.get('/reports/customers', { params });
    setCustomerReportData(data);
  }, [crStartDate, crEndDate]);
  const fetchSupplierReport = useCallback(async () => {
    const params: any = {};
    if (srStartDate) params.startDate = srStartDate;
    if (srEndDate) params.endDate = srEndDate;
    const { data } = await api.get('/reports/suppliers', { params });
    setSupplierReportData(data);
  }, [srStartDate, srEndDate]);
  const fetchCategorySales = useCallback(async () => {
    const params: any = {};
    if (csStartDate) params.startDate = csStartDate;
    if (csEndDate) params.endDate = csEndDate;
    const { data } = await api.get('/reports/category-sales', { params });
    setCategorySalesData(data);
  }, [csStartDate, csEndDate]);

  useEffect(() => {
    if (tab === 'sales') fetchSales();
    else if (tab === 'inventory') fetchInventory();
    else if (tab === 'financial') fetchFinancial();
    else if (tab === 'cashier') fetchCashier();
    else if (tab === 'commission') fetchCommission();
    else if (tab === 'cash-flow') fetchCashFlow();
    else if (tab === 'dead-stock') fetchDeadStock();
    else if (tab === 'customers') fetchCustomerReport();
    else if (tab === 'suppliers') fetchSupplierReport();
    else if (tab === 'categories') fetchCategorySales();
  }, [tab, period, fetchCashFlow, fetchDeadStock, fetchCustomerReport, fetchSupplierReport, fetchCategorySales]);

  const renderSummaryCard = (label: string, value: string | number, icon: any, opts?: { color?: string; bg?: string }) => {
    const Icon = icon;
    const bg = opts?.bg || 'bg-teal-50 text-teal-600 border-teal-100/30';
    const color = opts?.color || 'text-slate-800';
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start w-full">
        <div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{label}</span>
          <span className={`text-2xl font-extrabold mt-1.5 block tracking-tight ${color}`}>{value}</span>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border shadow-sm ${bg}`}>
          <Icon size={18} />
        </div>
      </div>
    );
  };

  const renderTable = (headers: string[], rows: (string | number)[][], alignRight?: boolean[]) => (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {headers.map((h, i) => (
                <th key={i} className={`py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase ${alignRight?.[i] ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-slate-50/40 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className={`py-4 px-6 text-sm ${ci === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'} ${alignRight?.[ci] ? 'text-right' : ''}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Analyze store revenue metrics and business growth charts</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 flex-wrap">
        {(['sales', 'inventory', 'financial', 'cashier', 'commission', 'cash-flow', 'dead-stock', 'customers', 'suppliers', 'categories'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
              tab === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 font-semibold'
            }`}>
            {t === 'cash-flow' ? 'Cash Flow' : t === 'dead-stock' ? 'Dead Stock' : t === 'category-sales' ? 'Category Sales' : t === 'category-sales2' ? '' : t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'sales' && salesData && (
        <div className="space-y-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              { label: 'Total Sales', value: formatCurrency(salesData.totalSales), icon: DollarSign },
              { label: 'Transactions', value: salesData.totalTransactions, icon: ShoppingCart },
              { label: 'Items Sold', value: salesData.totalItems, icon: TrendingUp },
              { label: 'Avg. Transaction', value: formatCurrency(salesData.averageTransaction), icon: Users },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start w-full">
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

      {tab === 'inventory' && inventoryData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
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
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start w-full">
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

      {tab === 'financial' && financialData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {[
              { label: 'Revenue', value: formatCurrency(financialData.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/30' },
              { label: 'Expenses', value: formatCurrency(financialData.expenses), icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50 border-red-100/30' },
              { label: 'Profit', value: formatCurrency(financialData.profit), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100/30' },
              { label: 'Tax Collected', value: formatCurrency(financialData.taxCollected), icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100/30' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start w-full">
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

      {tab === 'cash-flow' && (
        <div className="space-y-6">
          <div className="bg-slate-100 p-1 rounded-xl w-fit flex gap-1 flex-wrap">
            {[
              { key: '7days', label: 'Last 7 Days' },
              { key: 'month', label: 'This Month' },
              { key: 'quarter', label: 'This Quarter' },
              { key: 'custom', label: 'Custom' }
            ].map(p => (
              <button key={p.key} onClick={() => setCfPreset(p.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  cfPreset === p.key
                    ? 'bg-white border border-slate-200/40 text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 font-semibold'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          {cfPreset === 'custom' && (
            <div className="flex gap-3 items-center">
              <input type="date" value={cfStartDate} onChange={e => setCfStartDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" value={cfEndDate} onChange={e => setCfEndDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
          {cashFlowData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {[
                  { label: 'Net Cash Flow', value: formatCurrency(cashFlowData.netFlow), icon: DollarSign,
                    color: cashFlowData.netFlow >= 0 ? 'text-emerald-600' : 'text-red-600',
                    bg: cashFlowData.netFlow >= 0 ? 'bg-emerald-50 border-emerald-100/30' : 'bg-red-50 border-red-100/30' },
                  { label: 'Total Inflows', value: formatCurrency(cashFlowData.inflows.total), icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/30' },
                  { label: 'Total Outflows', value: formatCurrency(cashFlowData.outflows.total), icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50 border-red-100/30' },
                  { label: 'Expenses', value: formatCurrency(cashFlowData.outflows.expenses), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100/30' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-start w-full">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">{s.label}</span>
                        <span className={`text-2xl font-extrabold mt-1.5 block tracking-tight ${s.color}`}>{s.value}</span>
                      </div>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border shadow-sm ${s.bg}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
                {Object.entries(cashFlowData.inflows).filter(([k]) => k !== 'total').map(([method, amount]: [string, any]) => {
                  const Icon = INFLOW_ICONS[method] || DollarSign;
                  return (
                    <div key={method} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{method.replace(/_/g, ' ')}</span>
                      <span className="text-lg font-extrabold text-slate-800">{formatCurrency(amount)}</span>
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-4">Daily Trend</h3>
                {renderTable(
                  ['Date', 'Inflow', 'Outflow', 'Net'],
                  cashFlowData.dailyBreakdown.map((d: any) => [
                    formatDate(d.date),
                    formatCurrency(d.inflow),
                    formatCurrency(d.outflow),
                    formatCurrency(d.net)
                  ]),
                  [false, true, true, true]
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'dead-stock' && (
        <div className="space-y-6">
          <div className="flex gap-3 items-center">
            <label className="text-sm font-semibold text-slate-600">No movement in last</label>
            <input type="number" value={dsDays} onChange={e => setDsDays(parseInt(e.target.value) || 90)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-20 text-center" min={1} />
            <span className="text-sm text-slate-500">days</span>
          </div>
          {deadStockData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {renderSummaryCard('Dead Stock Products', deadStockData.count, Package)}
                {renderSummaryCard('Total Dead Stock Value', formatCurrency(deadStockData.totalValue), DollarSign, { color: 'text-red-600', bg: 'bg-red-50 border-red-100/30' })}
                {renderSummaryCard('Threshold Days', deadStockData.days, Clock)}
              </div>
              {deadStockData.products.length > 0 ? renderTable(
                ['Product', 'Stock Qty', 'Last Movement', 'Days Since', 'Total Value'],
                deadStockData.products.map((p: any) => [
                  p.name,
                  p.stockQuantity,
                  p.lastMovementDate ? formatDate(p.lastMovementDate) : 'Never moved',
                  p.daysSinceLastMovement !== null ? `${p.daysSinceLastMovement}d` : '-',
                  formatCurrency(p.totalValue)
                ]),
                [false, true, false, true, true]
              ) : (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">No dead stock products found</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-6">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={crStartDate} onChange={e => setCrStartDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={crEndDate} onChange={e => setCrEndDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          {customerReportData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {renderSummaryCard('Total Customers', customerReportData.totalCustomers, Users)}
                {renderSummaryCard('New Customers', customerReportData.newCustomers, UserCheck, { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/30' })}
                {renderSummaryCard('Repeat Rate', `${customerReportData.repeatRate}%`, ShoppingCart, { color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100/30' })}
              </div>
              {customerReportData.topCustomers.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-4">Top Customers by Spend</h3>
                  {renderTable(
                    ['#', 'Customer', 'Sales', 'Total Spent'],
                    customerReportData.topCustomers.map((c: any, i: number) => [
                      `#${i + 1}`,
                      c.name,
                      c.totalSales,
                      formatCurrency(c.totalSpent)
                    ]),
                    [false, false, true, true]
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={srStartDate} onChange={e => setSrStartDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={srEndDate} onChange={e => setSrEndDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          {supplierReportData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {renderSummaryCard('Total Suppliers', supplierReportData.totalSuppliers, Building)}
                {renderSummaryCard('Total Purchase Volume', formatCurrency(supplierReportData.totalPurchaseVolume), DollarSign, { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/30' })}
                {renderSummaryCard('Active Suppliers', supplierReportData.topSuppliers.filter((s: any) => s.totalPurchases > 0).length, Store, { color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100/30' })}
              </div>
              {supplierReportData.topSuppliers.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-4">Top Suppliers by Purchase Volume</h3>
                  {renderTable(
                    ['#', 'Supplier', 'Purchases', 'Total Amount'],
                    supplierReportData.topSuppliers.map((s: any, i: number) => [
                      `#${i + 1}`,
                      s.name,
                      s.totalPurchases,
                      formatCurrency(s.totalAmount)
                    ]),
                    [false, false, true, true]
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <div className="space-y-6">
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={csStartDate} onChange={e => setCsStartDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <span className="text-slate-400 text-sm">to</span>
            <input type="date" value={csEndDate} onChange={e => setCsEndDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          {categorySalesData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {renderSummaryCard('Total Sales', formatCurrency(categorySalesData.totalSales), DollarSign)}
                {renderSummaryCard('Categories', categorySalesData.categories.length, Layers)}
                {renderSummaryCard('Avg per Category', formatCurrency(categorySalesData.categories.length > 0 ? categorySalesData.totalSales / categorySalesData.categories.length : 0), TrendingUp)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 text-base mb-6">Category Sales Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categorySalesData.categories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Sales']} />
                      <Bar dataKey="totalSales" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 text-base mb-6">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categorySalesData.categories} cx="50%" cy="50%" outerRadius={100} dataKey="totalSales" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {categorySalesData.categories.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {renderTable(
                ['Category', 'Total Sales', 'Items Sold', '% of Total'],
                categorySalesData.categories.map((c: any) => [
                  c.name,
                  formatCurrency(c.totalSales),
                  c.itemCount,
                  `${c.percentage}%`
                ]),
                [false, true, true, true]
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
