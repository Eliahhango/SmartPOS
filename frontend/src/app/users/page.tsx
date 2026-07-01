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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', password: '', role: 'cashier', branchId: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 bg-gray-50"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Branch</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-50">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs capitalize">{u.role.replace('_', ' ')}</span></td>
                <td className="p-4 text-gray-500">{u.branch?.name || '-'}</td>
                <td className="p-4"><span className={`px-2 py-0.5 rounded-full text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(u); setForm({ name: u.name, email: u.email, phone: u.phone || '', password: '', role: u.role, branchId: u.branchId || '' }); setShowForm(true); }}
                      className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => toggleStatus(u)}
                      className={`p-1.5 rounded-lg ${u.status === 'active' ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`}>
                      {u.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
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
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} User</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg text-sm" />
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'New password (leave blank to keep)' : 'Password'} className="w-full px-3 py-2 border rounded-lg text-sm" required={!editing} />
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">No Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
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
