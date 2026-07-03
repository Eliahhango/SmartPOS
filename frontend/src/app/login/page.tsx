'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Check } from 'lucide-react';
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

  const features = [
    'Inventory Control',
    'Sales Reports',
    'Multi-Store Ready',
    'Split Payments',
    'Barcode Scanning',
    'Loyalty Program',
  ];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white font-sans">
      {/* Premium Left Branding Panel */}
      <div className="w-full md:w-1/2 bg-slate-900 relative flex flex-col justify-center p-8 lg:p-16 overflow-hidden">
        {/* Modern Ambient Radial Brand Glow */}
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-slate-800/50 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto md:mx-0">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-black tracking-tight text-white">
              Smart<span className="text-teal-400">POS</span>
            </span>
          </div>
          
          <h2 className="text-xl lg:text-2xl font-bold text-slate-200 mb-8 tracking-tight">
            The Simple, Secure, and Scalable Way to Run Your Business
          </h2>

          {/* Icon Checked Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <span className="flex-shrink-0 w-6 h-6 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className="text-sm font-medium tracking-wide text-slate-400">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Clean Right Content Panel */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-sm flex flex-col justify-between min-h-[500px]">
          {/* Main Content Card */}
          <div className="mt-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Welcome back</h3>
            <p className="text-sm text-slate-400 mt-1">Sign in to your account to continue</p>

            {/* Input fields */}
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@smartpos.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-500/10 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Demo Credentials Banner */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs space-y-2 mt-8">
            <div className="font-bold text-slate-600 tracking-wide uppercase text-[10px]">
              Demo Credentials:
            </div>
            <div className="space-y-1.5 text-slate-500">
              <div className="flex justify-between items-center">
                <span><span className="font-semibold text-slate-700">Admin:</span> admin@smartpos.com</span>
                <span className="font-mono text-slate-400">admin123</span>
              </div>
              <div className="flex justify-between items-center">
                <span><span className="font-semibold text-slate-700">Manager:</span> manager@smartpos.com</span>
                <span className="font-mono text-slate-400">manager123</span>
              </div>
              <div className="flex justify-between items-center">
                <span><span className="font-semibold text-slate-700">Cashier:</span> cashier@smartpos.com</span>
                <span className="font-mono text-slate-400">cashier123</span>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-teal-600 font-semibold transition-colors inline-flex items-center gap-1"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
