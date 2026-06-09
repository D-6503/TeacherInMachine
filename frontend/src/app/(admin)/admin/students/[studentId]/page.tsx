'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { ArrowLeft, BookOpen, CheckCircle2, Lock, Unlock, Calendar, Mail, User, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface StudentProgressItem {
  topic_id: string;
  topic_title: string;
  subject: string;
  status: string;
  best_score: number;
  attempts_count: number;
}

interface StudentDetailData {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  progress: StudentProgressItem[];
}

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;

  const { data: student, isLoading, error } = useQuery<StudentDetailData>({
    queryKey: ['admin-student-detail', studentId],
    queryFn: () => apiClient.get(`/api/admin/students/${studentId}/detail`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded-lg" />
        <div className="bg-card border border-border rounded-2xl p-6 h-40" />
        <div className="h-6 w-48 bg-muted rounded-lg" />
        <div className="bg-card border border-border rounded-2xl h-64" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl shadow-card">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-foreground font-semibold text-lg font-outfit">Error Loading Detail</p>
        <p className="text-muted-foreground text-sm mt-1">Student may not exist or database is offline.</p>
        <Link href="/admin/students" className="mt-4 text-primary hover:text-brand-600 font-semibold text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>
    );
  }

  const totalAttempts = student.progress.reduce((acc, curr) => acc + curr.attempts_count, 0);
  const passedTopics = student.progress.filter((p) => p.status === 'passed').length;
  const activeTopics = student.progress.filter((p) => p.status !== 'locked').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-primary/10">
            {student.name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground font-outfit">{student.name}</h1>
              {student.is_active ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <ShieldAlert className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1 font-medium">
              <Mail className="w-4 h-4 text-muted-foreground/70" /> {student.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary/70" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Joined Date</p>
              <p className="text-sm font-semibold text-foreground">
                {format(new Date(student.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500/70" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Account Role</p>
              <p className="text-sm font-semibold text-foreground capitalize">{student.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-foreground font-outfit">{passedTopics}</p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium uppercase tracking-wide">Passed Chapters</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-foreground font-outfit">{activeTopics}</p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium uppercase tracking-wide">Unlocked Chapters</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-foreground font-outfit">{totalAttempts}</p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium uppercase tracking-wide">Total Attempts</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-foreground font-outfit">
            {student.progress.length > 0
              ? `${Math.round((passedTopics / student.progress.length) * 100)}%`
              : '0%'}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium uppercase tracking-wide">Completion Rate</p>
        </div>
      </div>

      {/* Chapter Progress Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-bold text-foreground font-outfit">Chapter Progress</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Real-time status of each syllabus chapter</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left py-3 px-5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Subject</th>
              <th className="text-left py-3 px-5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Chapter Title</th>
              <th className="text-left py-3 px-5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Best Score</th>
              <th className="text-left py-3 px-5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {student.progress.map((item, idx) => (
              <tr key={idx} className="border-b border-border/60 hover:bg-muted/30 transition-colors last:border-0">
                <td className="py-3.5 px-5 font-semibold text-foreground text-xs uppercase tracking-wider">{item.subject}</td>
                <td className="py-3.5 px-5 text-foreground font-medium">{item.topic_title}</td>
                <td className="py-3.5 px-5">
                  {item.status === 'passed' && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                    </span>
                  )}
                  {item.status === 'unlocked' && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <Unlock className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  )}
                  {item.status === 'locked' && (
                    <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5">
                  {item.status !== 'locked' ? (
                    <span className="font-semibold text-primary">{item.best_score}/10</span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
                <td className="py-3.5 px-5 font-medium text-foreground">{item.attempts_count}</td>
              </tr>
            ))}
            {student.progress.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  No topic progress found for this student.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
