'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
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
      setAuth(user, access_token);

      // Role-aware redirect: admins and tutors → /admin, students → /dashboard
      if (user.role === 'admin' || user.role === 'tutor') {
        toast.success(`Welcome back, ${user.name}! Redirecting to admin panel…`);
        router.push('/admin');
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/90 border border-border rounded-3xl p-8 shadow-xl backdrop-blur-xl">
      {/* Back to Home Link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4">
        &larr; Back to Home
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center mb-8 bg-transparent">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-primary/25 border-2 border-primary/25 animate-float">
          <img src="/logo.jpg" alt="TIM Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-outfit">Student Sign In</h1>
        </div>
        <p className="text-muted-foreground text-sm">Teacher in Machine</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register('email')}
              type="email"
              placeholder="student@school.com"
              className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !mounted}
          className="w-full bg-gradient-to-r from-primary to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          {(!mounted || loading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {!mounted ? 'Initializing…' : loading ? 'Signing in…' : 'Sign In as Student'}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:text-brand-700 font-semibold transition-colors">
          Create account
        </Link>
      </p>

      {/* Admin portal link */}
      <div className="mt-5 pt-4 border-t border-border text-center">
        <Link
          href="/admin-login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Admin / Tutor Portal →
        </Link>
      </div>

      {/* Demo credentials */}
      <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-xl">
        <p className="text-xs text-primary font-bold text-center mb-1">Demo Credentials</p>
        <p className="text-xs text-muted-foreground text-center">student@timplatform.com / Student@1234</p>
      </div>
    </div>
  );
}
