'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', tinNumber: '' });

  const fetch = async () => { const { data } = await api.get('/suppliers'); setSuppliers(data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/suppliers/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/suppliers', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', phone: '', email: '', address: '', tinNumber: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return;
    await api.delete(`/suppliers/${id}`); toast.success('Deleted'); fetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '', tinNumber: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Supplier
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{s.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(s); setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', tinNumber: s.tinNumber || '' }); setShowForm(true); }}
                  className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-500">
              {s.phone && <div className="flex items-center gap-2"><Phone size={14} /> {s.phone}</div>}
              {s.email && <div className="flex items-center gap-2"><Mail size={14} /> {s.email}</div>}
              {s.address && <div className="flex items-center gap-2"><MapPin size={14} /> {s.address}</div>}
              {s.tinNumber && <p className="text-xs text-gray-400">TIN: {s.tinNumber}</p>}
            </div>
            <div className="mt-3 flex gap-3 text-xs text-gray-400">
              <span>{s._count?.products || 0} products</span>
              <span>{s._count?.purchases || 0} purchases</span>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Supplier</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.tinNumber} onChange={e => setForm({ ...form, tinNumber: e.target.value })} placeholder="TIN Number" className="w-full px-3 py-2 border rounded-lg text-sm" />
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
