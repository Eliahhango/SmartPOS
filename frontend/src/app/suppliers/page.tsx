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
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen w-full -m-4 sm:-m-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-xs text-slate-400 mt-1">Manage wholesale vendors and supply partners</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '', tinNumber: '' }); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Suppliers Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map(s => (
          <div
            key={s.id}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Card Title & Header Actions */}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 text-base tracking-tight group-hover:text-teal-600 transition-colors truncate max-w-[75%]">
                  {s.name}
                </h3>
                <div className="flex items-center gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(s); setForm({ name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', tinNumber: s.tinNumber || '' }); setShowForm(true); }}
                    className="text-slate-400 hover:text-teal-600 transition-colors p-0.5" title="Edit">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Contact Information Block */}
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-600">{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate text-slate-600">{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600">{s.address}</span>
                  </div>
                )}
              </div>

              {/* TIN Badge */}
              {s.tinNumber && (
                <div className="mt-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-0.5 tracking-wider uppercase">
                    TIN: {s.tinNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Inventory Metric Summary Footer */}
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
              <span className="bg-slate-50/50 px-2.5 py-1 rounded-md border border-slate-100/60 text-slate-500">
                {s._count?.products || 0} products
              </span>
              <span className="bg-slate-50/50 px-2.5 py-1 rounded-md border border-slate-100/60 text-slate-500">
                {s._count?.purchases || 0} purchases
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} Supplier</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Supplier Name"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input value={form.tinNumber} onChange={e => setForm({ ...form, tinNumber: e.target.value })} placeholder="TIN Number"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <div className="flex gap-2 pt-1">
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
