'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [form, setForm] = useState({ name: '', startTime: '', endTime: '' });
  const [assignForm, setAssignForm] = useState({ shiftId: '', userId: '', date: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/shifts'),
      api.get('/users'),
      api.get('/shifts/assignments')
    ]).then(([sRes, uRes, aRes]) => {
      setShifts(sRes.data);
      setUsers(uRes.data.users || uRes.data);
      setAssignments(aRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fetchAssignments = async (date?: string) => {
    const params: any = {};
    if (date) params.date = date;
    const { data } = await api.get('/shifts/assignments', { params });
    setAssignments(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await api.put(`/shifts/${editingShift.id}`, form);
        toast.success('Shift updated');
      } else {
        await api.post('/shifts', form);
        toast.success('Shift created');
      }
      setShowForm(false);
      setEditingShift(null);
      setForm({ name: '', startTime: '', endTime: '' });
      const { data } = await api.get('/shifts');
      setShifts(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save shift');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      toast.success('Shift deleted');
      setShifts(shifts.filter(s => s.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/shifts/assign', assignForm);
      toast.success('User assigned to shift');
      setAssignForm({ shiftId: '', userId: '', date: '' });
      fetchAssignments(filterDate);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to assign');
    }
  };

  const startEdit = (shift: any) => {
    setEditingShift(shift);
    setForm({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shift Management</h1>
          <p className="text-xs text-slate-400 mt-1">Create and assign work shifts</p>
        </div>
        <button onClick={() => { setEditingShift(null); setForm({ name: '', startTime: '', endTime: '' }); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-all">
          <Plus size={16} /> New Shift
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-800">{editingShift ? 'Edit Shift' : 'New Shift'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input placeholder="Shift name (e.g. Morning)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-all">
              {editingShift ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingShift(null); }}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Shifts</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Name</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Start</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">End</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shifts.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800">{s.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{s.startTime}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{s.endTime}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => startEdit(s)} className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 ml-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-slate-400">No shifts defined</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-4">Assign Shift</h3>
        <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <select value={assignForm.shiftId} onChange={e => setAssignForm({ ...assignForm, shiftId: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            <option value="">Select shift</option>
            {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
          </select>
          <select value={assignForm.userId} onChange={e => setAssignForm({ ...assignForm, userId: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required>
            <option value="">Select user</option>
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <input type="date" value={assignForm.date} onChange={e => setAssignForm({ ...assignForm, date: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-all">Assign</button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Assignments</h3>
          <div className="flex items-center gap-2">
            <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); fetchAssignments(e.target.value); }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
            {filterDate && <button onClick={() => { setFilterDate(''); fetchAssignments(); }} className="text-xs text-slate-500 hover:text-slate-700">Clear</button>}
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">User</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Shift</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800">{a.user.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{a.shift.name} ({a.shift.startTime}-{a.shift.endTime})</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{formatDate(a.date)}</td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-sm text-slate-400">No assignments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
