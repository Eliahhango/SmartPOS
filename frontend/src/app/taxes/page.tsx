'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', ratePercent: '', isActive: true });

  const fetch = async () => { const { data } = await api.get('/taxes'); setTaxes(data); };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/taxes/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/taxes', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', ratePercent: '', isActive: true }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Tax Rates</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', ratePercent: '', isActive: true }); setShowForm(true); }}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
          <Plus size={16} /> Add Tax Rate
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center items-center w-full">
        {taxes.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 w-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-2xl font-bold text-teal-600 mt-1">{t.ratePercent}%</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button onClick={() => { setEditing(t); setForm({ name: t.name, ratePercent: t.ratePercent, isActive: t.isActive }); setShowForm(true); }}
                className="p-1.5 hover:bg-teal-50 rounded-lg text-teal-600"><Edit size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Tax Rate</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name (e.g. Standard VAT)" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input type="number" value={form.ratePercent} onChange={e => setForm({ ...form, ratePercent: e.target.value })} placeholder="Rate %" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-xl text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl text-sm font-semibold">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
