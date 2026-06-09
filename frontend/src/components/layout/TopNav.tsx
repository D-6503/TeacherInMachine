'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

interface TopNavProps {
  onMenuClick?: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    const role = user?.role;
    logout();
    toast.success('Logged out successfully');
    if (role === 'admin' || role === 'tutor') {
      router.push('/admin-login');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b-4 border-[#2c1e14] bg-card/85 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/logo.jpg" alt="Teach In Machine Logo" className="w-8 h-8 rounded-lg object-cover border-2 border-[#2c1e14] shadow-[1.5px_1.5px_0px_#2c1e14] group-hover:scale-105 transition-all duration-300" />
            <span className="font-bold text-foreground hidden sm:block font-outfit text-lg tracking-wide">Teacher in Machine</span>
          </Link>
        </div>

        {/* Right: nav + user */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-sm transition-colors font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>

          {user?.role === 'admin' || user?.role === 'tutor' ? (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-lg text-brand-600 hover:text-brand-700 hover:bg-brand-50 text-sm font-semibold transition-colors"
            >
              Admin
            </Link>
          ) : null}

          {/* User menu */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
