'use client';
import { AttemptSummary } from '@/types';
import { Mic, Keyboard, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Props { attempts: AttemptSummary[]; }

const BLOOM_COLORS: Record<string, string> = {
  remember: 'bg-blue-50 text-blue-700 border border-blue-100',
  understand: 'bg-violet-50 text-violet-700 border border-violet-100',
  apply: 'bg-orange-50 text-orange-700 border border-orange-100',
};

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-muted-foreground text-xs">—</span>;
  const color = score >= 8 ? 'text-accent' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-bold text-sm ${color}`}>{score}/10</span>;
}

export default function AttemptHistoryTable({ attempts }: Props) {
  if (attempts.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-8">No attempts yet. Start answering questions!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Topic</th>
            <th className="text-left py-2 px-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Bloom</th>
            <th className="text-left py-2 px-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Score</th>
            <th className="text-left py-2 px-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Mode</th>
            <th className="text-left py-2 px-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.attempt_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium truncate max-w-[140px]">{a.topic_title}</span>
                  {a.cheat_flags.length > 0 && (
                    <span title="Cheat flags detected"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /></span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${BLOOM_COLORS[a.bloom_level] || 'bg-muted text-muted-foreground'}`}>
                  {a.bloom_level}
                </span>
              </td>
              <td className="py-2.5 px-2"><ScoreBadge score={a.score} /></td>
              <td className="py-2.5 px-2">
                {a.input_mode === 'voice'
                  ? <Mic className="w-3.5 h-3.5 text-violet-600" />
                  : <Keyboard className="w-3.5 h-3.5 text-muted-foreground" />}
              </td>
              <td className="py-2.5 px-2 text-muted-foreground text-xs whitespace-nowrap">
                {format(new Date(a.created_at), 'MMM d, HH:mm')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
