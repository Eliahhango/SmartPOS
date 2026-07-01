'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Check, Truck, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ supplierId: '', invoiceNo: '', date: '', items: [{ productId: '', quantity: 1, costPrice: '' }] });

  const fetch = async () => {
    const { data } = await api.get('/purchases', { params: { limit: 50 } });
    setPurchases(data.purchases);
  };
  const fetchMeta = async () => {
    const [sRes, pRes] = await Promise.all([api.get('/suppliers'), api.get('/products', { params: { limit: 200 } })]);
    setSuppliers(sRes.data); setProducts(pRes.data.products);
  };
  useEffect(() => { fetch(); fetchMeta(); }, []);

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

  const statusColors: any = { draft: 'bg-gray-100 text-gray-700', approved: 'bg-blue-100 text-blue-700', received: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> New Purchase
        </button>
      </div>

      <div className="grid gap-4">
        {purchases.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.supplier?.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Invoice: {p.invoiceNo || 'N/A'} • {formatDate(p.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">{formatCurrency(p.totalAmount)}</span>
                <button onClick={() => setSelected(p)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={16} /></button>
                {p.status === 'draft' && <button onClick={() => handleApprove(p.id)} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1"><Check size={14} /> Approve</button>}
                {p.status === 'approved' && <button onClick={() => handleReceive(p.id)} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1"><Truck size={14} /> Receive</button>}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.items?.map((item: any) => (
                <span key={item.id} className="text-xs bg-gray-50 px-2 py-1 rounded-lg">{item.product?.name} × {item.quantity}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Purchase Details</h3>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p><strong>Supplier:</strong> {selected.supplier?.name}</p>
              <p><strong>Invoice:</strong> {selected.invoiceNo || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(selected.date)}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selected.status]}`}>{selected.status}</span></p>
              <p><strong>Total:</strong> {formatCurrency(selected.totalAmount)}</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="pb-2">Product</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Cost</th><th className="pb-2 text-right">Total</th></tr></thead>
              <tbody>
                {selected.items?.map((item: any) => (
                  <tr key={item.id} className="border-t"><td className="py-2">{item.product?.name}</td><td className="py-2 text-right">{item.quantity}</td><td className="py-2 text-right">{formatCurrency(item.costPrice)}</td><td className="py-2 text-right font-semibold">{formatCurrency(item.quantity * item.costPrice)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">New Purchase Order</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} placeholder="Invoice No" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Items</span><button type="button" onClick={addItem} className="text-xs text-blue-600">+ Add Item</button></div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <select value={item.productId} onChange={e => { const items = [...form.items]; items[i].productId = e.target.value; setForm({ ...form, items }); }} className="px-2 py-1.5 border rounded-lg text-xs" required>
                      <option value="">Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={item.quantity} onChange={e => { const items = [...form.items]; items[i].quantity = parseInt(e.target.value) || 1; setForm({ ...form, items }); }} placeholder="Qty" className="px-2 py-1.5 border rounded-lg text-xs" />
                    <input type="number" value={item.costPrice} onChange={e => { const items = [...form.items]; items[i].costPrice = e.target.value; setForm({ ...form, items }); }} placeholder="Cost Price" className="px-2 py-1.5 border rounded-lg text-xs" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold">Create PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
