'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Download, Upload, RefreshCw, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BackupPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState('');

  const fetchBackups = async () => {
    try {
      const { data } = await api.get('/backup/list');
      setBackups(data);
    } catch {}
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/backup/create', {}, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup created and downloaded');
      fetchBackups();
    } catch (err: any) {
      toast.error('Backup failed');
    } finally { setCreating(false); }
  };

  const handleRestore = async (filename: string) => {
    if (!confirm('Restoring will replace all current data with the backup. Continue?')) return;
    setRestoring(filename);
    try {
      const { data } = await api.post(`/backup/restore/${filename}`);
      toast.success(data.message || 'Restore complete');
      fetchBackups();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Restore failed');
    } finally { setRestoring(''); }
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Backup & Restore</h1>
          <p className="text-xs text-slate-400 mt-1">Create and restore database backups</p>
        </div>
        <button onClick={handleCreate} disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm shadow-teal-500/10 transition-colors disabled:opacity-50">
          <Database size={16} />
          {creating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[500px] text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Filename</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Size</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Created</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Database size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">No backups yet</p>
                    <p className="text-xs text-slate-300 mt-1">Create your first backup to protect your data</p>
                  </td>
                </tr>
              ) : (
                backups.map(b => (
                  <tr key={b.filename} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-800 font-mono">{b.filename}</td>
                    <td className="py-4 px-4 text-sm text-slate-500">{(b.size / 1024).toFixed(1)} KB</td>
                    <td className="py-4 px-4 text-xs text-slate-500">{formatDateTime(b.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/api/backup/create`} download
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download size={16} />
                        </a>
                        <button onClick={() => handleRestore(b.filename)}
                          disabled={restoring === b.filename}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30" title="Restore">
                          <RefreshCw size={16} className={restoring === b.filename ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-amber-800 mb-1">Important</h3>
        <p className="text-xs text-amber-700">Backups are stored on the server filesystem. Download them regularly to ensure off-site protection. Restoring a backup will replace ALL current data.</p>
      </div>
    </div>
  );
}
