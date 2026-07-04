'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Check, Truck, Eye, X, ChevronRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ supplierId: '', invoiceNo: '', date: '', items: [{ productId: '', quantity: 1, costPrice: '' }] });
  const LIMIT = 20;

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT, search };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/purchases', { params });
      setPurchases(data.purchases);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };
  const fetchMeta = async () => {
    const [sRes, pRes] = await Promise.all([api.get('/suppliers'), api.get('/products', { params: { limit: 200 } })]);
    setSuppliers(sRes.data); setProducts(pRes.data.products);
  };
  useEffect(() => { setPage(1); }, [statusFilter, search]);
  useEffect(() => { fetch(); fetchMeta(); }, [statusFilter, search, page]);

  const filteredPurchases = purchases;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchases', form);
      toast.success('Purchase order created');
      setShowForm(false); setForm({ supplierId: '', invoiceNo: '', date: '', items: [{ productId: '', quantity: 1, costPrice: '' }] }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleApprove = async (id: number) => {
    await api.post(`/purchases/${id}/approve`);
    toast.success('Approved'); fetch();
  };

  const handleReceive = async (id: number) => {
    await api.post(`/purchases/${id}/receive`);
    toast.success('Goods received, stock updated'); fetch();
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, costPrice: '' }] });

  const statusBadge = (status: string) => {
    const styles: any = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      approved: 'bg-teal-50 text-teal-700 border-teal-100/50',
      received: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    };
    const dots: any = {
      draft: 'bg-slate-400',
      approved: 'bg-teal-500',
      received: 'bg-emerald-500',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[status] || styles.draft}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.draft}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      {/* Page Header */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchase Orders</h1>
          <p className="text-xs text-slate-400 mt-1">Track and manage incoming inventory orders</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> New Purchase
        </button>
      </div>

      {/* Utility Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Order ID or Supplier..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-teal-500 font-medium">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="received">Received</option>
        </select>
      </div>

      {/* Purchase Orders List with Loading / Empty / Pagination */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 w-full min-h-[300px] bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-300">
            <Package size={28} />
          </div>
          <h3 className="text-slate-800 font-semibold mt-4">No Purchase Orders</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-2 mb-6 block whitespace-normal break-words">
            {search || statusFilter ? 'No orders match your filters.' : 'Create your first purchase order to track inventory.'}
          </p>
          {!search && !statusFilter && (
            <button onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors">
              Create Order
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {purchases.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-800">{p.supplier?.name}</span>
                      {statusBadge(p.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Invoice: {p.invoiceNo || 'N/A'} • {formatDate(p.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-teal-600">{formatCurrency(p.totalAmount)}</span>
                    <button onClick={() => setSelected(p)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    {p.status === 'draft' && (
                      <button onClick={() => handleApprove(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors border border-teal-100/50">
                        <Check size={14} /> Approve
                      </button>
                    )}
                    {p.status === 'approved' && (
                      <button onClick={() => handleReceive(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-100/50">
                        <Truck size={14} /> Receive
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {p.items?.map((item: any) => (
                    <span key={item.id} className="text-xs bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-100 font-medium">
                      {item.product?.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex justify-between items-center mt-2">
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
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Purchase Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Supplier</span>
                <span className="font-semibold text-slate-800">{selected.supplier?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium text-slate-700">{selected.invoiceNo || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-700">{formatDate(selected.date)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Status</span>
                {statusBadge(selected.status)}
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-teal-600 text-base">{formatCurrency(selected.totalAmount)}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Line Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    <th className="pb-2 font-semibold">Product</th>
                    <th className="pb-2 font-semibold text-right">Qty</th>
                    <th className="pb-2 font-semibold text-right">Cost</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selected.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-slate-700 font-medium">{item.product?.name}</td>
                      <td className="py-2.5 text-right text-slate-600">{item.quantity}</td>
                      <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.costPrice)}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">{formatCurrency(item.quantity * item.costPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">New Purchase Order</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} placeholder="Invoice No"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Items</span>
                  <button type="button" onClick={addItem}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">+ Add Item</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <select value={item.productId} onChange={e => { const items = [...form.items]; items[i].productId = e.target.value; setForm({ ...form, items }); }}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-500" required>
                      <option value="">Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={item.quantity} onChange={e => { const items = [...form.items]; items[i].quantity = parseInt(e.target.value) || 1; setForm({ ...form, items }); }}
                      placeholder="Qty" className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-500" />
                    <input type="number" value={item.costPrice} onChange={e => { const items = [...form.items]; items[i].costPrice = e.target.value; setForm({ ...form, items }); }}
                      placeholder="Cost Price" className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/10 transition-colors">
                  Create PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
