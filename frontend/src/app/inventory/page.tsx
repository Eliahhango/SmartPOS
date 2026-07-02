'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Plus, Search, AlertTriangle, Package, ArrowDown, ArrowUp } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button onClick={() => setShowAdjust(true)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Stock Adjustment
        </button>
      </div>

      <div className="flex gap-2">
        {['stock', 'movements'].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {t === 'stock' ? 'Current Stock' : 'Stock Movements'}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" />
            </div>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 bg-slate-50"><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Stock</th><th className="p-4">Min Stock</th><th className="p-4">Status</th><th className="p-4">Expiry</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t border-gray-50">
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-slate-500">{p.category?.name || '-'}</td>
                    <td className="p-4 font-semibold">{p.stockQuantity}</td>
                    <td className="p-4 text-slate-500">{p.minimumStock}</td>
                    <td className="p-4">
                      {p.stockQuantity === 0 ? <span className="text-red-600 flex items-center gap-1"><AlertTriangle size={14} /> Out</span> :
                       p.stockQuantity <= p.minimumStock ? <span className="text-orange-600 flex items-center gap-1"><AlertTriangle size={14} /> Low</span> :
                       <span className="text-emerald-600">OK</span>}
                    </td>
                    <td className="p-4 text-xs text-slate-400">{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 bg-slate-50"><th className="p-4">Date</th><th className="p-4">Product</th><th className="p-4">Change</th><th className="p-4">Reason</th><th className="p-4">User</th><th className="p-4">Notes</th></tr></thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id} className="border-t border-gray-50">
                  <td className="p-4 text-xs">{formatDateTime(m.createdAt)}</td>
                  <td className="p-4 font-medium">{m.product?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 font-semibold ${m.changeQty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.changeQty > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {Math.abs(m.changeQty)}
                    </span>
                  </td>
                  <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs capitalize">{m.reason}</span></td>
                  <td className="p-4 text-slate-500">{m.user?.name || '-'}</td>
                  <td className="p-4 text-xs text-slate-400">{m.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">Stock Adjustment</h3>
            <form onSubmit={handleAdjust} className="space-y-3">
              <select value={adjustForm.productId} onChange={e => setAdjustForm({ ...adjustForm, productId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>)}
              </select>
              <input type="number" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Quantity (+ for in, - for out)" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <select value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="adjustment">Manual Adjustment</option>
                <option value="damage">Damaged Goods</option>
                <option value="expiry">Expired Goods</option>
              </select>
              <textarea value={adjustForm.notes} onChange={e => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                placeholder="Notes (required)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAdjust(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-semibold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
