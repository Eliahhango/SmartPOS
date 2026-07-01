'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Plus, Search, Edit, Phone, Mail, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [selected, setSelected] = useState<any>(null);

  const fetch = async () => {
    const { data } = await api.get('/customers', { params: { search, page, limit: 20 } });
    setCustomers(data.customers); setTotal(data.total);
  };
  useEffect(() => { fetch(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/customers/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/customers', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', phone: '', email: '', address: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const viewDetails = async (id: number) => {
    const { data } = await api.get(`/customers/${id}`);
    setSelected(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Customers</h1><p className="text-gray-500 text-sm">{total} customers</p></div>
        <button onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </button>
      </div>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customers..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewDetails(c.id)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">{c.name[0]}</div>
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <div className="flex items-center gap-1 text-xs text-yellow-500"><Star size={12} fill="currentColor" /> {c.points} pts</div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              {c.phone && <div className="flex items-center gap-2"><Phone size={14} /> {c.phone}</div>}
              {c.email && <div className="flex items-center gap-2"><Mail size={14} /> {c.email}</div>}
              {c.address && <div className="flex items-center gap-2"><MapPin size={14} /> {c.address}</div>}
            </div>
            <p className="text-xs text-gray-400 mt-2">{c._count?.sales || 0} purchases</p>
          </div>
        ))}
      </div>

      {/* Customer Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p><strong>Phone:</strong> {selected.phone || '-'}</p>
              <p><strong>Email:</strong> {selected.email || '-'}</p>
              <p><strong>Address:</strong> {selected.address || '-'}</p>
              <p><strong>Loyalty Points:</strong> {selected.points}</p>
              <p><strong>Total Purchases:</strong> {selected.sales?.length || 0}</p>
            </div>
            {selected.sales?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Purchase History</h4>
                <div className="space-y-2">
                  {selected.sales.map((s: any) => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs">{s.invoiceNo}</span>
                        <span className="font-semibold">{formatCurrency(s.grandTotal)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{formatDateTime(s.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
