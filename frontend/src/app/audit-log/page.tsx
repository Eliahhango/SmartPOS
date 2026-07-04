'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Search, History } from 'lucide-react';

const actionColors: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-blue-50 text-blue-700 border-blue-200',
  delete: 'bg-red-50 text-red-700 border-red-200',
  login: 'bg-violet-50 text-violet-700 border-violet-200',
  logout: 'bg-slate-50 text-slate-600 border-slate-200',
  refund: 'bg-amber-50 text-amber-700 border-amber-200',
  restore: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entities, setEntities] = useState<{ entity: string; count: number }[]>([]);
  const LIMIT = 30;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const { data } = await api.get('/audit-logs', { params });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {} finally { setLoading(false); }
  };

  const fetchEntities = async () => {
    try {
      const { data } = await api.get('/audit-logs/entities');
      setEntities(data);
    } catch {}
  };

  useEffect(() => { fetchEntities(); }, []);
  useEffect(() => { setPage(1); }, [entityFilter, actionFilter]);
  useEffect(() => { fetchLogs(); }, [page, entityFilter, actionFilter]);

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
          <p className="text-xs text-slate-400 mt-1">{total} events recorded</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-teal-500">
            <option value="">All Entities</option>
            {entities.map(e => (
              <option key={e.entity} value={e.entity}>{e.entity} ({e.count})</option>
            ))}
          </select>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-teal-500">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="refund">Refund</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px] text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Time</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">User</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Action</th>
                <th className="py-3.5 px-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Entity</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Description</th>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <History size={32} className="text-slate-300" />
                      <p className="text-sm text-slate-400 font-medium">No audit events found</p>
                      <p className="text-xs text-slate-300">Events appear here as you use the system</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      <span className="font-medium">{log.user?.name || 'System'}</span>
                      {log.user?.role && <span className="text-xs text-slate-400 ml-1">({log.user.role})</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${actionColors[log.action] || 'bg-slate-100 text-slate-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600 capitalize">{log.entity}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate" title={log.description || ''}>{log.description || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex justify-between items-center">
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
  );
}
