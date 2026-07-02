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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Expenses</h1><p className="text-gray-500 text-sm">Total: {formatCurrency(total)}</p></div>
        <button onClick={() => { setEditing(null); setForm({ expenseType: 'Rent', amount: '', description: '', date: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 bg-gray-50"><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Description</th><th className="p-4 text-right">Amount</th><th className="p-4"></th></tr></thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-t border-gray-50">
                <td className="p-4 text-xs">{formatDate(e.date)}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{e.expenseType}</span></td>
                <td className="p-4 text-gray-500">{e.description || '-'}</td>
                <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(e); setForm({ expenseType: e.expenseType, amount: e.amount, description: e.description || '', date: e.date?.slice(0, 10) }); setShowForm(true); }}
                      className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Expense</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
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
