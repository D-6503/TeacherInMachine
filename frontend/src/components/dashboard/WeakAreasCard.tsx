'use client';
import Link from 'next/link';
import { WeakArea } from '@/types';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface Props { weakAreas: WeakArea[]; }

export default function WeakAreasCard({ weakAreas }: Props) {
  if (weakAreas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-accent">
        <AlertCircle className="w-8 h-8 mb-2 opacity-60" />
        <p className="text-sm font-semibold">No weak areas!</p>
        <p className="text-xs text-muted-foreground mt-1">Great performance across all topics</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {weakAreas.slice(0, 6).map((area) => {
        const pct = Math.round((area.best_score / 10) * 100);
        return (
          <div key={area.topic_id} className="group">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[160px]">
                  {area.topic_title}
                </p>
                <p className="text-xs text-muted-foreground">{area.subject}</p>
              </div>
              <Link
                href={`/learn/${area.topic_id}`}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-brand-600 transition-colors flex-shrink-0"
              >
                Study <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">{pct}% Mastery</span>
              <p className="text-xs font-bold text-foreground">{area.best_score.toFixed(1)}/10</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
