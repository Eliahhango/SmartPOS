'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Clock, LogIn, LogOut, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [status, setStatus] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [weekRecords, setWeekRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [todayRes, recordsRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance', { params: { limit: 50 } })
      ]);
      setStatus(todayRes.data);
      setRecords(recordsRes.data.records || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (records.length > 0) {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const week = records.filter((r: any) => new Date(r.clockIn) >= weekAgo);
      setWeekRecords(week);
    }
  }, [records]);

  const handleClockIn = async () => {
    setClocking(true);
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to clock in');
    } finally {
      setClocking(false);
    }
  };

  const handleClockOut = async () => {
    setClocking(true);
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to clock out');
    } finally {
      setClocking(false);
    }
  };

  const calculateHours = (clockIn: string, clockOut?: string) => {
    const start = new Date(clockIn).getTime();
    const end = clockOut ? new Date(clockOut).getTime() : Date.now();
    const ms = end - start;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const weekTotalHours = weekRecords.reduce((sum: number, r: any) => {
    if (!r.clockOut) return sum;
    return sum + (new Date(r.clockOut).getTime() - new Date(r.clockIn).getTime());
  }, 0);

  const formatMs = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
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

  const isClockedIn = status?.isClockedIn;

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 mx-auto bg-slate-50/50">
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-xs text-slate-400 mt-1">Clock in / out and track your work hours</p>
        </div>
      </div>

      <button
        onClick={isClockedIn ? handleClockOut : handleClockIn}
        disabled={clocking}
        className={`w-full sm:w-auto self-center flex items-center gap-3 px-10 py-6 rounded-2xl text-xl font-bold shadow-lg transition-all ${
          isClockedIn
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {clocking ? (
          <Loader2 className="animate-spin" size={28} />
        ) : isClockedIn ? (
          <LogOut size={28} />
        ) : (
          <LogIn size={28} />
        )}
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Status</span>
          <span className={`text-lg font-extrabold mt-1.5 block ${isClockedIn ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isClockedIn ? 'Clocked In' : 'Not Clocked In'}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Today's Hours</span>
          <span className="text-lg font-extrabold mt-1.5 block text-slate-800">
            {status?.attendance ? calculateHours(status.attendance.clockIn, status.attendance.clockOut) : '-'}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">This Week</span>
          <span className="text-lg font-extrabold mt-1.5 block text-slate-800">{formatMs(weekTotalHours)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Attendance Records</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Clock In</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Clock Out</th>
                <th className="py-3.5 px-6 text-xs font-semibold tracking-wider text-slate-400 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-sm text-slate-700">{formatDateTime(r.clockIn)}</td>
                  <td className="py-4 px-6 text-sm text-slate-700">{r.clockOut ? formatDateTime(r.clockOut) : <span className="text-emerald-600 font-medium">Active</span>}</td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-800">{calculateHours(r.clockIn, r.clockOut)}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-slate-400">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
