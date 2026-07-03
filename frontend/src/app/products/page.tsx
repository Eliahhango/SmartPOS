'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [taxRates, setTaxRates] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: '', barcode: '', sku: '', categoryId: '', supplierId: '', costPrice: '', sellingPrice: '', taxClassId: '', unit: 'pcs', stockQuantity: 0, minimumStock: 0, expiryDate: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search, page, limit: 20 } });
      setProducts(data.products);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const fetchMeta = async () => {
    const [catRes, supRes, taxRes] = await Promise.all([
      api.get('/categories'), api.get('/suppliers'), api.get('/taxes')
    ]);
    setCategories(catRes.data);
    setSuppliers(supRes.data);
    setTaxRates(taxRes.data);
  };

  useEffect(() => { fetchProducts(); }, [page, search]);
  useEffect(() => { fetchMeta(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', barcode: '', sku: '', categoryId: '', supplierId: '', costPrice: '', sellingPrice: '', taxClassId: '', unit: 'pcs', stockQuantity: 0, minimumStock: 0, expiryDate: '' });
      fetchProducts();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, barcode: p.barcode || '', sku: p.sku || '', categoryId: p.categoryId || '', supplierId: p.supplierId || '', costPrice: p.costPrice, sellingPrice: p.sellingPrice, taxClassId: p.taxClassId || '', unit: p.unit, stockQuantity: p.stockQuantity, minimumStock: p.minimumStock, expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Discontinue this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product discontinued');
    fetchProducts();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/products/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Imported ${data.created} products`);
      fetchProducts();
    } catch (err: any) { toast.error('Import failed'); }
  };

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen w-full -m-4 sm:-m-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-xs text-slate-400 mt-1">{total} products total</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
            <Upload size={16} /> Import
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => { setEditing(null); setForm({ name: '', barcode: '', sku: '', categoryId: '', supplierId: '', costPrice: '', sellingPrice: '', taxClassId: '', unit: 'pcs', stockQuantity: 0, minimumStock: 0, expiryDate: '' }); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search Filter Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, barcode, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Products Clean Table Panel */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Product</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Barcode/SKU</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Category</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Cost</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Selling</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Stock</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-slate-500">{p.barcode || '-'} / {p.sku || '-'}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{p.category?.name || '-'}</td>
                  <td className="py-4 px-4 text-sm text-slate-600 font-medium">{formatCurrency(p.costPrice)}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800">{formatCurrency(p.sellingPrice)}</td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${
                      p.stockQuantity === 0 ? 'text-red-600' :
                      p.stockQuantity <= p.minimumStock ? 'text-amber-600' :
                      'text-slate-700'
                    }`}>{p.stockQuantity}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/30' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <span className={`w-1 h-1 rounded-full mr-0.5 ${p.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / 20))}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            Previous
          </button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Barcode"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500">
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500">
                  <option value="">Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="Cost Price"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                <input type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} placeholder="Selling Price"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                <select value={form.taxClassId} onChange={e => setForm({ ...form, taxClassId: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500">
                  <option value="">Tax Class</option>
                  {taxRates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.ratePercent}%)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Unit (pcs, kg, L)"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                <input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} placeholder="Stock Qty"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                <input type="number" value={form.minimumStock} onChange={e => setForm({ ...form, minimumStock: e.target.value })} placeholder="Min Stock"
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
              </div>
              <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/10 transition-colors">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
