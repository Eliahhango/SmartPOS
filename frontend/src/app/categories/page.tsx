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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{c.description || 'No description'}</p>
                <p className="text-xs text-gray-400 mt-2">{c._count?.products || 0} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '' }); setShowForm(true); }}
                  className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"><Edit size={16} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-zoom-in">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Category</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} />
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
