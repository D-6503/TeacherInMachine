'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { AdminStudent } from '@/types';
import { Users, CheckCircle2, XCircle, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';

export default function StudentsAdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const { data: students = [], isLoading } = useQuery<AdminStudent[]>({
    queryKey: ['admin-students'],
    queryFn: () => apiClient.get('/api/admin/students').then((r) => r.data),
  });

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-muted/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-outfit">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">{students.length} registered students</p>
        </div>
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-56"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Name</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Email</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Joined</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Attempts</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Passed</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors last:border-0">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name[0].toUpperCase()}
                    </div>
                    <span className="text-foreground font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                <td className="py-3 px-4 text-muted-foreground text-xs">{format(new Date(s.created_at), 'MMM d, yyyy')}</td>
                <td className="py-3 px-4 text-foreground font-medium">{s.attempt_count}</td>
                <td className="py-3 px-4 text-foreground font-medium">{s.passed_topics}</td>
                <td className="py-3 px-4">
                  {s.is_active
                    ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Active</span>
                    : <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-medium px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Inactive</span>}
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors inline-flex"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {search ? 'No students match your search.' : 'No students registered yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
