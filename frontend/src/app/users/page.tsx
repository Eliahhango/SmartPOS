'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Shield, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = ['admin', 'manager', 'cashier', 'stock_officer'];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'cashier', branchId: '' });

  const fetch = async () => {
    const [uRes, bRes] = await Promise.all([api.get('/users'), api.get('/branches')]);
    setUsers(uRes.data); setBranches(bRes.data);
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const data: any = { name: form.name, email: form.email, phone: form.phone, role: form.role, branchId: form.branchId || null };
        if (form.password) data.password = form.password;
        await api.put(`/users/${editing.id}`, data);
        toast.success('User updated');
      } else {
        await api.post('/auth/register', form);
        toast.success('User created');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', email: '', phone: '', password: '', role: 'cashier', branchId: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const toggleStatus = async (user: any) => {
    const endpoint = user.status === 'active' ? 'suspend' : 'activate';
    await api.put(`/users/${user.id}/${endpoint}`);
    toast.success(`User ${user.status === 'active' ? 'suspended' : 'activated'}`);
    fetch();
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', password: '', role: 'cashier', branchId: '' }); setShowForm(true); }}
          className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Add User
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[600px] md:min-w-full text-left border-collapse table-auto">
          <thead><tr className="border-b border-slate-100 bg-slate-50/70"><th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Name</th><th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Email</th><th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Role</th><th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Branch</th><th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Status</th><th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="py-4 px-6 text-sm font-semibold text-slate-800">{u.name}</td>
                <td className="py-4 px-4 text-sm text-slate-500">{u.email}</td>
                <td className="py-4 px-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-100 capitalize">{u.role.replace('_', ' ')}</span></td>
                <td className="py-4 px-4 text-sm text-slate-500">{u.branch?.name || '-'}</td>
                <td className="py-4 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-red-50 text-red-700 border-red-100/50'}`}>{u.status}</span></td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setEditing(u); setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.role, branchId: u.branchId || '' }); setShowForm(true); }}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit"><Edit size={15} /></button>
                    <button onClick={() => toggleStatus(u)}
                      className={`p-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                      {u.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} User</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'New password (leave blank to keep)' : 'Password'} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required={!editing} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                {roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500">
                <option value="">No Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
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
