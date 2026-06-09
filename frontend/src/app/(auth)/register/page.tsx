'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, User, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: data.name, email: data.email, password: data.password,
      });
      const { access_token } = res.data;
      const meRes = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setAuth(meRes.data, access_token);
      toast.success('Account created! Welcome to TIM.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    name,
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    error,
  }: {
    name: keyof FormData;
    label: string;
    type?: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
    error?: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-foreground/80 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="bg-card/90 border border-border rounded-3xl p-8 shadow-xl backdrop-blur-xl">
      {/* Back to Home Link */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-4">
        &larr; Back to Home
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center mb-7">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-primary/25 border-2 border-primary/25 animate-float">
          <img src="/logo.jpg" alt="Teach In Machine Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <h1 className="text-2xl font-bold text-foreground font-outfit">Create Account</h1>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Start your learning journey with Teacher in Machine</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField name="name" label="Full Name" placeholder="Arjun Sharma" icon={User} error={errors.name?.message} />
        <InputField name="email" label="Email" type="email" placeholder="you@example.com" icon={Mail} error={errors.email?.message} />
        <InputField name="password" label="Password" type="password" placeholder="••••••••" icon={Lock} error={errors.password?.message} />
        <InputField name="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" icon={Lock} error={errors.confirmPassword?.message} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-brand-700 hover:from-brand-400 hover:to-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-muted-foreground text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-brand-700 font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
