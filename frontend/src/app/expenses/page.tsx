'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const expenseTypes = ['Rent', 'Electricity', 'Internet', 'Transport', 'Salary', 'Maintenance', 'Supplies', 'Marketing', 'Other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ expenseType: 'Rent', amount: '', description: '', date: '' });

  const fetch = async () => {
    const { data } = await api.get('/expenses', { params: { limit: 100 } });
    setExpenses(data.expenses);
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/expenses/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/expenses', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ expenseType: 'Rent', amount: '', description: '', date: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`); toast.success('Deleted'); fetch();
  };

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="p-4 sm:p-6 bg-slate-50/50 min-h-screen w-full -m-4 sm:-m-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-xs font-bold text-teal-600 mt-1 bg-teal-50 border border-teal-100/50 rounded-md px-2.5 py-0.5 inline-block">
            Total: {formatCurrency(total)}
          </p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ expenseType: 'Rent', amount: '', description: '', date: '' }); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Expenses Ledger Sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[600px] text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Date</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Type</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Description</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Amount</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="py-4 px-6 text-sm font-medium text-slate-600">{formatDate(e.date)}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                      {e.expenseType}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500">{e.description || '—'}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800 text-right">{formatCurrency(e.amount)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(e); setForm({ expenseType: e.expenseType, amount: e.amount, description: e.description || '', date: e.date?.slice(0, 10) }); setShowForm(true); }}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(e.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
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
