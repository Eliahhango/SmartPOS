'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Upload, Download, Barcode } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500 text-sm">{total} products</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2">
            <Upload size={16} /> Import
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => { setEditing(null); setForm({ name: '', barcode: '', sku: '', categoryId: '', supplierId: '', costPrice: '', sellingPrice: '', taxClassId: '', unit: 'pcs', stockQuantity: 0, minimumStock: 0, expiryDate: '' }); setShowForm(true); }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, barcode, or SKU..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 bg-gray-50"><th className="p-4 font-medium">Product</th><th className="p-4 font-medium">Barcode/SKU</th><th className="p-4 font-medium">Category</th><th className="p-4 font-medium">Cost</th><th className="p-4 font-medium">Selling</th><th className="p-4 font-medium">Stock</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium"></th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-xs font-mono text-gray-500">{p.barcode || '-'} / {p.sku || '-'}</td>
                <td className="p-4 text-gray-500">{p.category?.name || '-'}</td>
                <td className="p-4">{formatCurrency(p.costPrice)}</td>
                <td className="p-4 font-semibold text-indigo-600">{formatCurrency(p.sellingPrice)}</td>
                <td className="p-4">
                  <span className={`${p.stockQuantity <= p.minimumStock ? 'text-red-600' : 'text-green-600'}`}>{p.stockQuantity}</span>
                </td>
                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">Previous</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Barcode" className="px-3 py-2 border rounded-lg text-sm" />
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="Cost Price" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} placeholder="Selling Price" className="px-3 py-2 border rounded-lg text-sm" />
                <select value={form.taxClassId} onChange={e => setForm({ ...form, taxClassId: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
                  <option value="">Tax Class</option>
                  {taxRates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.ratePercent}%)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Unit (pcs, kg, L)" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} placeholder="Stock Qty" className="px-3 py-2 border rounded-lg text-sm" />
                <input type="number" value={form.minimumStock} onChange={e => setForm({ ...form, minimumStock: e.target.value })} placeholder="Min Stock" className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
