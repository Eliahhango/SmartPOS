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
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#090727] via-[#0f0b3d] to-[#1a1050] text-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="relative z-10 text-center px-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">SmartPOS</h1>
          <p className="text-xl text-white/70 mb-8">The Simple, Secure, and Scalable Way to Run Your Business</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {['Inventory Control', 'Split Payments', 'Sales Reports', 'Barcode Scanning', 'Multi-Store Ready', 'Loyalty Program'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                <span className="text-green-400">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text">SmartPOS</h1>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@smartpos.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Admin:</strong> admin@smartpos.com / admin123</p>
              <p><strong>Manager:</strong> manager@smartpos.com / manager123</p>
              <p><strong>Cashier:</strong> cashier@smartpos.com / cashier123</p>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-slate-500">
            <Link href="/" className="text-teal-600 hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
