'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetch = async () => {
    const { data } = await api.get('/categories');
    setCategories(data);
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/categories/${editing.id}`, form); toast.success('Updated'); }
      else { await api.post('/categories', form); toast.success('Created'); }
      setShowForm(false); setEditing(null); setForm({ name: '', description: '' }); fetch();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Deleted'); fetch();
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen w-full -m-6">
      {/* Top Header Row */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categories</h1>
          <p className="text-xs text-slate-400 mt-1">Manage store inventory categories</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(c => (
          <div
            key={c.id}
            className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Card Title & Actions Header */}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 text-base tracking-tight group-hover:text-teal-600 transition-colors">
                  {c.name}
                </h3>
                <div className="flex items-center gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); }}
                    className="text-slate-400 hover:text-teal-600 transition-colors p-0.5" title="Edit">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-[90%]">
                {c.description || 'No description'}
              </p>
            </div>

            {/* Product Counter Tag */}
            <div className="mt-4">
              <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">
                {c._count?.products || 0} products
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editing ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category Name"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" required />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" rows={3} />
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
