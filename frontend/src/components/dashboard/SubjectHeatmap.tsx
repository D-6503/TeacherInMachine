'use client';
import { TopicProgressItem } from '@/types';

interface Props { topicProgress: TopicProgressItem[]; }

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics'];

function scoreToColor(status: string, score: number): string {
  if (status === 'locked') return 'bg-muted/60 text-muted-foreground border-border/60';
  if (status === 'passed' && score >= 8) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (status === 'passed' && score >= 6) return 'bg-amber-50 text-amber-800 border-amber-200';
  if (status === 'passed') return 'bg-rose-50 text-rose-800 border-rose-200';
  if (status === 'in_progress') return 'bg-brand-50 text-primary border-brand-200';
  return 'bg-muted/60 text-muted-foreground border-border/60';
}

export default function SubjectHeatmap({ topicProgress }: Props) {
  const bySubject: Record<string, TopicProgressItem[]> = {};
  SUBJECTS.forEach((s) => { bySubject[s] = topicProgress.filter((t) => t.subject === s); });

  return (
    <div className="grid grid-cols-3 gap-4">
      {SUBJECTS.map((subject) => {
        const topics = bySubject[subject] || [];
        return (
          <div key={subject}>
            <p className="text-xs font-bold text-muted-foreground mb-2.5 uppercase tracking-wider">{subject}</p>
            <div className="space-y-2">
              {topics.map((t) => (
                <div
                  key={t.topic_id}
                  title={`${t.topic_title}: ${t.best_score.toFixed(1)}/10`}
                  className={`h-8 rounded-xl border flex items-center px-3 text-xs font-semibold truncate transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${scoreToColor(t.status, t.best_score)}`}
                >
                  {t.topic_title}
                </div>
              ))}
              {topics.length === 0 && (
                <div className="h-8 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center text-xs text-muted-foreground">No topics</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
