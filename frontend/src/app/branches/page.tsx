'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Store, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', isMainBranch: false });

  const fetch = async () => { const { data } = await api.get('/branches'); setBranches(data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/branches/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/branches', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', address: '', phone: '', isMainBranch: false }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branches</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', address: '', phone: '', isMainBranch: false }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Branch
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map(b => (
          <div key={b.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
                  <Store size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  {b.isMainBranch && <span className="text-xs text-yellow-600 flex items-center gap-1"><Star size={10} fill="currentColor" /> Main Branch</span>}
                </div>
              </div>
              <button onClick={() => { setEditing(b); setForm({ name: b.name, address: b.address || '', phone: b.phone || '', isMainBranch: b.isMainBranch }); setShowForm(true); }}
                className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600"><Edit size={16} /></button>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              {b.address && <p>{b.address}</p>}
              {b.phone && <p>{b.phone}</p>}
            </div>
            <p className="text-xs text-gray-400 mt-2">{b._count?.users || 0} users</p>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Branch</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Branch Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isMainBranch} onChange={e => setForm({ ...form, isMainBranch: e.target.checked })} />
                Main Branch
              </label>
              <div className="flex gap-2">
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
