'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', creditLimit: '', birthday: '' });
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<{ customerId: number; customerName: string } | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', notes: '' });
  const LIMIT = 20;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { search, page, limit: 20 } });
      setCustomers(data.customers); setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/customers/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/customers', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', phone: '', email: '', address: '', creditLimit: '', birthday: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    try {
      await api.post(`/customers/${payModal.customerId}/payments`, payForm);
      toast.success('Payment recorded');
      setPayModal(null); setPayForm({ amount: '', method: 'cash', notes: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const viewDetails = async (id: number) => {
    const { data } = await api.get(`/customers/${id}`);
    setSelected(data);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      {/* Top Header Row */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-xs text-slate-400 mt-1">{total} customers total</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '', creditLimit: '', birthday: '' }); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Modern Search Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customers by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Customers Grid Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center items-center w-full">
        {customers.map(c => (
          <div
            key={c.id}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-200 flex flex-col justify-between group cursor-pointer w-full"
            onClick={() => viewDetails(c.id)}
          >
            <div>
              {/* Profile Top Row Headers */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3.5">
                  {/* Clean Circle Initial Badge */}
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100/40 shrink-0">
                    {getInitials(c.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base tracking-tight group-hover:text-teal-600 transition-colors">
                      {c.name}
                    </h3>
                    {/* Modern Loyalty Tag */}
                    <div className="flex gap-1.5 mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/30">
                        <Star size={10} fill="currentColor" /> {c.points} pts
                      </span>
                      {c.balance > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200/30">
                          ${c.balance.toFixed(2)}
                        </span>
                      )}
                      {c.creditLimit > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/30">
                          Limit: ${c.creditLimit.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Micro Actions Menu */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setEditing(c); setForm({ name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '', creditLimit: c.creditLimit || '', birthday: c.birthday ? c.birthday.slice(0, 10) : '' }); setShowForm(true); }}
                    className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                    <Edit size={15} />
                  </button>
                </div>
              </div>

              {/* Customer Contact Details block */}
              <div className="mt-5 space-y-2 text-xs text-slate-500">
                {c.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-600">{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600 truncate">{c.email}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="text-slate-600">{c.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Metric Summary Footer */}
            <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="bg-slate-50/60 px-2.5 py-1 rounded-md border border-slate-100/50 text-slate-500">
                {c._count?.sales || 0} purchases
              </span>
              {c.balance > 0 && (
                <button onClick={e => { e.stopPropagation(); setPayModal({ customerId: c.id, customerName: c.name }); }}
                  className="text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-100/50 text-[11px] font-bold transition-colors">
                  Collect ${c.balance.toFixed(2)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Customer Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-zoom-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 font-bold flex items-center justify-center text-sm border border-teal-100/40">
                  {getInitials(selected.name)}
                </div>
                <h3 className="text-lg font-bold text-slate-800">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-slate-400" />
                <span>{selected.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={14} className="text-slate-400" />
                <span>{selected.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span>{selected.address || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700">
                <Star size={14} className="text-amber-500" fill="currentColor" />
                <span className="font-semibold">{selected.points} loyalty points</span>
              </div>
              {selected.balance > 0 && (
                <div className="flex items-center gap-2 text-red-700">
                  <span className="font-semibold text-sm">Balance: ${selected.balance.toFixed(2)}</span>
                  {selected.creditLimit > 0 && <span className="text-xs text-slate-400">(Limit: ${selected.creditLimit.toFixed(0)})</span>}
                </div>
              )}
              <p className="text-slate-500 text-xs mt-1">{selected.sales?.length || 0} total purchases</p>
            </div>
            {selected.sales?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">Purchase History</h4>
                <div className="space-y-2">
                  {selected.sales.map((s: any) => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs font-medium text-slate-700">{s.invoiceNo}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(s.grandTotal)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(s.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Receive Payment</h3>
            <p className="text-xs text-slate-400 mb-4">{payModal.customerName}</p>
            <form onSubmit={handlePayment} className="space-y-3">
              <input type="number" step="0.01" min="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="Amount"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
              </select>
              <input value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Notes (optional)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setPayModal(null)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/10 transition-colors">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer Name"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Address"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
              {editing && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: e.target.value })} placeholder="Credit Limit"
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" />
                  <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                </div>
              )}
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
