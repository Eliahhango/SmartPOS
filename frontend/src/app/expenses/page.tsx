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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ expenseType: 'Rent', amount: '', description: '', date: '' });
  const LIMIT = 25;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses', { params: { page, limit: LIMIT } });
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [page]);

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

  const totalAmount = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      {/* Page Header */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-xs font-bold text-teal-600 mt-1 bg-teal-50 border border-teal-100/50 rounded-md px-2.5 py-0.5 inline-block">
            Total: {formatCurrency(totalAmount)}
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
          <table className="w-full min-w-[600px] md:min-w-full text-left border-collapse table-auto">
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
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-sm text-slate-400 font-medium">No expenses recorded</p>
                    <p className="text-xs text-slate-300 mt-1">Add your first expense to start tracking</p>
                  </td>
                </tr>
              ) : (
                expenses.map(e => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <span className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / LIMIT))} ({total} total)</span>
            <div className="flex gap-1 items-center">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">First</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹ Prev</button>
              {Array.from({ length: Math.min(5, Math.ceil(total / LIMIT)) }, (_, i) => {
                const totalPages = Math.ceil(total / LIMIT);
                let start = Math.max(1, page - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                      p === page ? 'bg-teal-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">Next ›</button>
              <button onClick={() => setPage(Math.ceil(total / LIMIT))} disabled={page >= Math.ceil(total / LIMIT)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors">Last</button>
            </div>
          </div>
        )}
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
