'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans selection:bg-teal-500/10 selection:text-teal-600">
      {/* Decorative Brand Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-slate-400/10 blur-[100px] pointer-events-none" />

      {/* Main Professional Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 p-8 md:p-10">
        
        {/* Central Card Header & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-2.5">
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Smart<span className="text-teal-500">POS</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Please enter your account details below to access the platform</p>
        </div>

        {/* Credentials Form Structure */}
        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@smartpos.com"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-150"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <button type="button" className="text-[11px] font-semibold text-slate-400 hover:text-teal-600 transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-150"
              />
            </div>
          </div>

          {/* Action Call to Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/10 hover:shadow-teal-600/20 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Demo Account Helper — emails only, passwords not exposed */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-4 text-[11px]">
            <span className="block font-bold text-slate-500 uppercase tracking-wide mb-2.5 text-[10px]">
              Demo Accounts:
            </span>
            <div className="space-y-1.5 text-slate-500">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Administrator:</span>
                <span className="font-mono text-slate-400">admin@smartpos.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Store Manager:</span>
                <span className="font-mono text-slate-400">manager@smartpos.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Store Cashier:</span>
                <span className="font-mono text-slate-400">cashier@smartpos.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minor Footer Platform Navigation Anchor */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors inline-flex items-center gap-1"
          >
            ← Return to corporate homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
