'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Admin password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', data);
      const { access_token } = res.data;
      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const user = meRes.data;

      // Strictly enforce: only admin/tutor roles allowed here
      if (user.role !== 'admin' && user.role !== 'tutor') {
        toast.error('Access denied — students cannot use the admin portal.', {
          description: 'Please use the student login page.',
          duration: 6000,
        });
        setLoading(false);
        return;
      }

      setAuth(user, access_token);
      toast.success(`Welcome, ${user.name}! Loading admin panel…`);
      router.push('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Override the auth layout's light background with a full dark cover */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050814] overflow-auto py-8">
      {/* Dark professional background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#0c1130] to-[#050814]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-violet-700/8 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-brand-500/6 rounded-full blur-2xl" />
      </div>
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Admin badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 rounded-full px-4 py-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-[0.15em]">Admin Portal</span>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/30 border border-indigo-500/30 animate-float">
                <img src="/logo.jpg" alt="TIM Logo" className="w-full h-full object-cover" />
              </div>
              {/* Shield badge overlay */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-[#050814]">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white font-outfit">Teacher in Machine Admin Access</h1>
            <p className="text-slate-400 text-sm mt-1.5 text-center">
              Restricted to Administrators &amp; Tutors
            </p>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed font-medium">
              This is a restricted portal. Only authorized administrators and tutors may sign in. Student accounts will be blocked.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="admin@institution.com"
                  autoComplete="username"
                  className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !mounted}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 border border-indigo-500/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {(!mounted || loading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {!loading && <Shield className="w-4 h-4" />}
              {!mounted ? 'Initializing…' : loading ? 'Verifying Admin Access…' : 'Access Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 flex items-center justify-between">
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium flex items-center gap-1"
            >
              ← Student Login
            </Link>
            <span className="text-xs text-slate-700">Teacher in Machine · Admin v1.0</span>
          </div>

          {/* Demo admin credentials */}
          <div className="mt-4 p-3 bg-indigo-500/8 border border-indigo-500/15 rounded-xl">
            <p className="text-xs text-indigo-300 text-center font-bold mb-1">Demo Admin Credentials</p>
            <p className="text-xs text-slate-400 text-center">admin@timplatform.com / Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
