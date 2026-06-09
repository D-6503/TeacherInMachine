'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { CheatFlagRow } from '@/types';
import { AlertTriangle, CheckCircle2, ChevronUp, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${colors[severity] || 'bg-muted text-muted-foreground border-border'}`}>
      {severity}
    </span>
  );
}

export default function CheatFlagsPage() {
  const qc = useQueryClient();
  const [actionId, setActionId] = useState<string | null>(null);

  const { data: flags = [], isLoading } = useQuery<CheatFlagRow[]>({
    queryKey: ['cheat-flags'],
    queryFn: () => apiClient.get('/api/admin/cheat-flags').then((r) => r.data),
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/admin/cheat-flags/${id}/dismiss`),
    onSuccess: () => { toast.success('Flag dismissed'); qc.invalidateQueries({ queryKey: ['cheat-flags'] }); setActionId(null); },
    onError: () => toast.error('Failed to dismiss'),
  });

  const escalate = useMutation({
    mutationFn: (id: string) => apiClient.post(`/api/admin/cheat-flags/${id}/escalate`),
    onSuccess: () => { toast.success('Flag escalated'); qc.invalidateQueries({ queryKey: ['cheat-flags'] }); setActionId(null); },
    onError: () => toast.error('Failed to escalate'),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted/60 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">Cheat Flags</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {flags.length} flagged attempt{flags.length !== 1 ? 's' : ''} pending review
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl shadow-card">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-foreground font-semibold text-lg font-outfit">All Clear!</p>
          <p className="text-muted-foreground text-sm mt-1">No pending cheat flags to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((row) => (
            <div key={row.attempt_id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {row.student_name[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-foreground">{row.student_name}</span>
                    <span className="text-muted-foreground/60 text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{row.student_email}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 pl-9">
                    Topic: <span className="text-foreground font-medium">{row.topic_title}</span>
                    {row.score != null && <> · Score: <span className="text-primary font-semibold">{row.score}/10</span></>}
                    <> · <span className="text-xs">{format(new Date(row.created_at), 'MMM d, HH:mm')}</span></>
                  </p>

                  {/* Flags list */}
                  <div className="flex flex-wrap gap-2 pl-9">
                    {row.cheat_flags.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-700 font-medium">{f.detail}</span>
                        <SeverityBadge severity={f.severity} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setActionId(row.attempt_id); dismiss.mutate(row.attempt_id); }}
                    disabled={dismiss.isPending && actionId === row.attempt_id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {dismiss.isPending && actionId === row.attempt_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Dismiss
                  </button>
                  <button
                    onClick={() => { setActionId(row.attempt_id); escalate.mutate(row.attempt_id); }}
                    disabled={escalate.isPending && actionId === row.attempt_id}
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    {escalate.isPending && actionId === row.attempt_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronUp className="w-3 h-3" />}
                    Escalate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
