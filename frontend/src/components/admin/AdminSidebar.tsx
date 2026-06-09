'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Video, AlertTriangle, ChevronRight, FileText } from 'lucide-react';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/topics', label: 'Topics & PDFs', icon: FileText },
  { href: '/admin/questions', label: 'Questions', icon: BookOpen },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/flags', label: 'Cheat Flags', icon: AlertTriangle },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full bg-card border-r border-border py-6 px-3 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 mb-6 pb-5 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-brand-700 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
            <path d="M30 40C30 25 45 20 50 20C55 20 70 25 70 40C70 50 65 55 60 58V65H40V58C35 55 30 50 30 40Z" fill="currentColor" className="opacity-80" />
            <circle cx="42" cy="40" r="3" fill="white" />
            <circle cx="58" cy="40" r="3" fill="white" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground font-outfit leading-none">Teacher in Machine</p>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">Admin Panel</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Navigation</p>
      <nav className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
