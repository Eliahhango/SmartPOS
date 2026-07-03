'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this tax rate?')) return;
    try {
      await api.delete(`/taxes/${id}`);
      toast.success('Tax rate deleted');
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tax Rates</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', ratePercent: '', isActive: true }); setShowForm(true); }}
          className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-500/10 transition-colors">
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 border ${t.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-slate-100 text-slate-500 border-slate-100'}`}>
                  {t.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(t); setForm({ name: t.name, ratePercent: t.ratePercent, isActive: t.isActive }); setShowForm(true); }}
                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit"><Edit size={15} /></button>
                <button onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} Tax Rate</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name (e.g. Standard VAT)" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input type="number" value={form.ratePercent} onChange={e => setForm({ ...form, ratePercent: e.target.value })} placeholder="Rate %" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <label className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
                Active
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/10 transition-colors">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
