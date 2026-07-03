'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Plus, Search, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ productId: '', quantity: 0, reason: 'adjustment', notes: '' });

  const fetchStock = async () => {
    const params: any = { limit: 100 };
    if (filter === 'low') params.lowStock = 'true';
    if (filter === 'out') params.outOfStock = 'true';
    if (filter === 'expiring') params.expiring = 'true';
    if (search) params.search = search;
    const { data } = await api.get('/inventory/stock', { params });
    setProducts(data.products);
  };

  const fetchMovements = async () => {
    const { data } = await api.get('/inventory/stock-movements', { params: { limit: 100 } });
    setMovements(data.movements);
  };

  useEffect(() => { tab === 'stock' ? fetchStock() : fetchMovements(); }, [tab, filter, search]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/adjustment', adjustForm);
      toast.success('Stock adjusted');
      setShowAdjust(false); fetchStock(); fetchMovements();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen w-full -m-4 sm:-m-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1">Track product counts, minimum values, and expiry alerts</p>
        </div>
        <button onClick={() => setShowAdjust(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Stock Adjustment
        </button>
      </div>

      {/* Modern Filter Subheader Controls */}
      <div className="flex items-center gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
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

      {/* Search Input Container Box */}
      {tab === 'stock' && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products by title, vendor, or SKU..."
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
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
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
                {products.map(p => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movements Table */}
      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Date</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Product</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Change</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Reason</th>
                  <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">User</th>
                  <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map(m => (
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
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 capitalize">
                        {m.reason}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">{m.user?.name || '—'}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
