'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Plus, Search, AlertTriangle, ArrowDown, ArrowUp, ArrowRightFromLine, ArrowLeftFromLine, PackageOpen, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 25;
  const [showAdjust, setShowAdjust] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showStockOut, setShowStockOut] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState<{ total: number; critical: number; low: number } | null>(null);
  const [reorderSuggestions, setReorderSuggestions] = useState<any>(null);
  const [showReorderSuggestions, setShowReorderSuggestions] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ productId: '', quantity: 0, reason: 'adjustment', notes: '' });
  const [stockInForm, setStockInForm] = useState({ productId: '', quantity: 1, notes: '', referenceNo: '', batchNumber: '' });
  const [stockOutForm, setStockOutForm] = useState({ productId: '', quantity: 1, reason: 'damage', notes: '' });

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (filter === 'low') params.lowStock = 'true';
      if (filter === 'out') params.outOfStock = 'true';
      if (filter === 'expiring') params.expiring = 'true';
      if (search) params.search = search;
      const { data } = await api.get('/inventory/stock', { params });
      setProducts(data.products);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/inventory/stock-movements', { params: { page, limit: LIMIT } });
      setMovements(data.movements);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const { data } = await api.get('/inventory/low-stock-alerts');
      setLowStockAlert(data);
    } catch {}
  };

  const fetchReorderSuggestions = async () => {
    try {
      const { data } = await api.get('/inventory/reorder-suggestions');
      setReorderSuggestions(data);
    } catch {}
  };

  useEffect(() => { fetchLowStockAlerts(); }, []);
  useEffect(() => { if (showReorderSuggestions) fetchReorderSuggestions(); }, [showReorderSuggestions]);
  useEffect(() => { setPage(1); }, [tab, filter, search]);
  useEffect(() => { tab === 'stock' ? fetchStock() : fetchMovements(); }, [tab, filter, search, page]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjustment', adjustForm);
      toast.success('Stock adjusted');
      setShowAdjust(false); fetchStock(); fetchMovements();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-in', stockInForm);
      toast.success('Stock received successfully');
      setShowStockIn(false); setStockInForm({ productId: '', quantity: 1, notes: '', referenceNo: '', batchNumber: '' }); fetchStock(); fetchMovements();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/stock-out', stockOutForm);
      toast.success('Stock removed');
      setShowStockOut(false); setStockOutForm({ productId: '', quantity: 1, reason: 'damage', notes: '' }); fetchStock(); fetchMovements();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      {/* Top Header Row */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1">Track product counts, minimum values, and expiry alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowStockIn(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-emerald-500/10 transition-colors">
            <ArrowRightFromLine size={16} /> Stock In
          </button>
          <button onClick={() => setShowStockOut(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-500/10 transition-colors">
            <ArrowLeftFromLine size={16} /> Stock Out
          </button>
          <button onClick={() => setShowAdjust(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
            <Plus size={16} /> Adjustment
          </button>
        </div>
      </div>

      {/* Modern Filter Subheader Controls */}
      <div className="flex items-center gap-1 mb-0 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('stock')}
          className={`px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all ${
            tab === 'stock'
              ? 'bg-white text-slate-800 border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}>
          Current Stock
        </button>
        <button onClick={() => setTab('movements')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'movements'
              ? 'bg-white text-slate-800 border border-slate-200/40 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}>
          Stock Movements
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockAlert && lowStockAlert.total > 0 && (
        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              {lowStockAlert.critical > 0
                ? `${lowStockAlert.critical} product(s) out of stock`
                : `${lowStockAlert.total} product(s) below minimum stock`}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowStockAlert.critical > 0 && <span className="font-semibold">{lowStockAlert.critical} critical (out of stock)</span>}
              {lowStockAlert.critical > 0 && lowStockAlert.low > 0 && <span> &middot; </span>}
              {lowStockAlert.low > 0 && <span>{lowStockAlert.low} low on stock</span>}
              <span> &middot; Use <strong>Stock In</strong> to restock</span>
            </p>
          </div>
          <button onClick={() => { setFilter('low'); setSearch(''); }}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100/50 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            View All
          </button>
        </div>
      )}

      {/* Reorder Suggestions */}
      {tab === 'stock' && (
        <div>
          <button onClick={() => { setShowReorderSuggestions(!showReorderSuggestions); if (!showReorderSuggestions) fetchReorderSuggestions(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold rounded-lg border border-violet-200/60 transition-colors">
            <PackageOpen size={16} />
            {reorderSuggestions ? `${reorderSuggestions.total} Reorder Suggestions ($${reorderSuggestions.totalEstimatedCost.toFixed(2)})` : 'Check Reorder Suggestions'}
          </button>
        </div>
      )}

      {showReorderSuggestions && reorderSuggestions && (
        <div className="bg-white rounded-xl border border-violet-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-violet-50 to-violet-50/50 border-b border-violet-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-violet-800">Reorder Suggestions</h3>
              <p className="text-xs text-violet-500">{reorderSuggestions.total} product(s) need restocking — est. cost ${reorderSuggestions.totalEstimatedCost.toFixed(2)}</p>
            </div>
            <button onClick={() => setShowReorderSuggestions(false)}
              className="text-xs text-violet-500 hover:text-violet-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-violet-200">
              Hide
            </button>
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[600px] text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3 px-5 text-xs font-semibold tracking-wider text-slate-400 uppercase">Supplier</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Product</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Current</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Min</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Reorder Qty</th>
                  <th className="py-3 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reorderSuggestions.bySupplier.map((group: any, gi: number) => (
                  <React.Fragment key={gi}>
                    <tr className="bg-violet-50/40">
                      <td colSpan={6} className="py-2 px-5 text-xs font-bold text-violet-700">
                        {group.supplier} — {group.count} product(s), est. ${group.total.toFixed(2)}
                      </td>
                    </tr>
                    {group.items.map((s: any) => (
                      <tr key={s.productId} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 px-5 text-xs text-slate-400">{group.supplier}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-800">{s.productName}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`font-bold ${s.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                            {s.currentStock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500">{s.minimumStock}</td>
                        <td className="py-3 px-4 text-sm font-bold text-violet-700">{s.reorderQuantity} {s.unit}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">${s.estimatedCost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Input Container Box */}
      {tab === 'stock' && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products by name, barcode, or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-teal-500 font-medium">
            <option value="">All Stock</option>
            <option value="low">Low Stock Alert</option>
            <option value="out">Out of Stock</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      )}

      {/* Current Stock Table */}
      {tab === 'stock' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[600px] md:min-w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Product</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Category</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Stock</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Min Stock</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th>
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm text-slate-400 font-medium">No products found</p>
                    <p className="text-xs text-slate-300 mt-1">Adjust your filter or add new stock</p>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800">{p.name}</td>
                    <td className="py-4 px-4 text-sm text-slate-500 font-medium">{p.category?.name || '—'}</td>
                    <td className="py-4 px-4 text-sm text-slate-800 font-bold">{p.stockQuantity}</td>
                    <td className="py-4 px-4 text-sm text-slate-400 font-medium">{p.minimumStock}</td>
                    <td className="py-4 px-4">
                      {p.stockQuantity === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100/30">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          Out
                        </span>
                      ) : p.stockQuantity <= p.minimumStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100/30">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/30">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination — Stock */}
      {tab === 'stock' && total > LIMIT && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / LIMIT))} ({total} total)</span>
          <div className="flex gap-1 items-center">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">First</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹ Prev</button>
            {Array.from({ length: Math.min(5, Math.ceil(total / LIMIT)) }, (_, i) => {
              const totalPages = Math.ceil(total / LIMIT);
              let start = Math.max(1, page - 2);
              if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                    p === page ? 'bg-teal-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>{p}</button>
              );
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next ›</button>
            <button onClick={() => setPage(Math.ceil(total / LIMIT))} disabled={page >= Math.ceil(total / LIMIT)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">Last</button>
          </div>
        </div>
      )}

      {/* Stock Movements Table */}
      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[700px] md:min-w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Date</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Product</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Change</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Type</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Reason</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Batch</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">User</th>
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm text-slate-400 font-medium">No stock movements recorded</p>
                    <p className="text-xs text-slate-300 mt-1">Movements appear when stock is added, removed, or adjusted</p>
                  </td>
                </tr>
              ) : (
                movements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">{formatDateTime(m.createdAt)}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-slate-800">{m.product?.name || '—'}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                        m.changeQty > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {m.changeQty > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {Math.abs(m.changeQty)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        m.reason === 'stock_in' ? 'bg-emerald-50 text-emerald-700' :
                        m.reason === 'stock_out' ? 'bg-red-50 text-red-700' :
                        m.reason === 'adjustment' ? 'bg-amber-50 text-amber-700' :
                        m.reason === 'sale' ? 'bg-blue-50 text-blue-700' :
                        m.reason === 'purchase' ? 'bg-violet-50 text-violet-700' :
                        m.reason === 'return' ? 'bg-teal-50 text-teal-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {m.reason === 'stock_in' ? 'Stock In' :
                         m.reason === 'stock_out' ? 'Stock Out' :
                         m.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-slate-400 capitalize">{m.referenceType || '—'}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">{m.batchNumber || '—'}</td>
                    <td className="py-4 px-4 text-sm text-slate-500">{m.user?.name || '—'}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">{m.notes || '—'}</td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination — Movements */}
      {tab === 'movements' && total > LIMIT && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / LIMIT))} ({total} total)</span>
          <div className="flex gap-1 items-center">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">First</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹ Prev</button>
            {Array.from({ length: Math.min(5, Math.ceil(total / LIMIT)) }, (_, i) => {
              const totalPages = Math.ceil(total / LIMIT);
              let start = Math.max(1, page - 2);
              if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                    p === page ? 'bg-teal-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>{p}</button>
              );
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next ›</button>
            <button onClick={() => setPage(Math.ceil(total / LIMIT))} disabled={page >= Math.ceil(total / LIMIT)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">Last</button>
          </div>
        </div>
      )}

      {/* ── Stock In Modal ── */}
      {showStockIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/30">
                <PackageOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Stock In</h3>
                <p className="text-xs text-slate-400">Receive stock into inventory</p>
              </div>
            </div>
            <form onSubmit={handleStockIn} className="space-y-3">
              <select value={stockInForm.productId} onChange={e => setStockInForm({ ...stockInForm, productId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
              </select>
              <input type="number" min="1" value={stockInForm.quantity} onChange={e => setStockInForm({ ...stockInForm, quantity: parseInt(e.target.value) || 1 })}
                placeholder="Quantity"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" required />
              <input type="text" value={stockInForm.referenceNo} onChange={e => setStockInForm({ ...stockInForm, referenceNo: e.target.value })}
                placeholder="Reference / PO Number (optional)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              <input type="text" value={stockInForm.batchNumber} onChange={e => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                placeholder="Batch / Lot Number (optional)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              <textarea value={stockInForm.notes} onChange={e => setStockInForm({ ...stockInForm, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" rows={2} />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowStockIn(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-500/10 transition-colors">
                  Receive Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Stock Out Modal ── */}
      {showStockOut && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100/30">
                <PackageX size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Stock Out</h3>
                <p className="text-xs text-slate-400">Remove stock from inventory</p>
              </div>
            </div>
            <form onSubmit={handleStockOut} className="space-y-3">
              <select value={stockOutForm.productId} onChange={e => setStockOutForm({ ...stockOutForm, productId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
              </select>
              <input type="number" min="1" value={stockOutForm.quantity} onChange={e => setStockOutForm({ ...stockOutForm, quantity: parseInt(e.target.value) || 1 })}
                placeholder="Quantity to remove"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" required />
              <select value={stockOutForm.reason} onChange={e => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" required>
                <option value="damage">Damaged Goods</option>
                <option value="expiry">Expired Goods</option>
                <option value="theft">Theft / Missing</option>
                <option value="return_to_supplier">Return to Supplier</option>
                <option value="other">Other</option>
              </select>
              <textarea value={stockOutForm.notes} onChange={e => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
                placeholder="Reason notes (required)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" rows={2} required />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowStockOut(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-red-500/10 transition-colors">
                  Remove Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Adjustment</h3>
            <form onSubmit={handleAdjust} className="space-y-3">
              <select value={adjustForm.productId} onChange={e => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
              </select>
              <input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Quantity (+ for in, - for out)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <select value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500">
                <option value="adjustment">Manual Adjustment</option>
                <option value="damage">Damaged Goods</option>
                <option value="expiry">Expired Goods</option>
              </select>
              <textarea value={adjustForm.notes} onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                placeholder="Notes (required)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" rows={2} />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAdjust(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/10 transition-colors">
                  Submit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
