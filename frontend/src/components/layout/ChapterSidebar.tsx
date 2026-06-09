'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, Circle, CheckCircle2, Atom, FlaskConical, Calculator, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useProgressStore } from '@/store/progress-store';
import { useAuthStore } from '@/store/auth-store';
import { Subject, Topic } from '@/types';

const SUBJECT_ICONS: Record<string, any> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'from-blue-500 to-sky-400',
  Chemistry: 'from-emerald-500 to-teal-400',
  Mathematics: 'from-amber-500 to-orange-500',
};

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  Physics: 'Physics',
  Chemistry: 'Chemistry',
  Mathematics: 'Maths',
};

interface Props {
  onNavigate?: () => void;
}

export default function ChapterSidebar({ onNavigate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { currentSubjectId, currentTopicId, setCurrentSubject, setTopics } = useProgressStore();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: () => apiClient.get('/api/subjects').then((r) => r.data),
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string>('');

  useEffect(() => {
    if (subjects.length && !activeSubjectId) {
      setActiveSubjectId(subjects[0].id);
      setCurrentSubject(subjects[0].id);
    }
  }, [subjects]);

  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ['topics', activeSubjectId],
    queryFn: () => apiClient.get(`/api/subjects/${activeSubjectId}/topics`).then((r) => r.data),
    enabled: !!activeSubjectId,
  });

  useEffect(() => {
    if (topics.length) setTopics(topics);
  }, [topics]);

  const passedCount = topics.filter((t) => t.status === 'passed').length;
  const activeSubject = subjects.find((s) => s.id === activeSubjectId);
  const Icon = SUBJECT_ICONS[activeSubject?.name || ''] || Calculator;
  const gradient = SUBJECT_COLORS[activeSubject?.name || ''] || 'from-indigo-500 to-violet-500';

  const handleTopicClick = (topic: Topic) => {
    if (topic.status === 'locked') return;
    onNavigate?.();
    router.push(`/learn/${topic.id}`);
  };

  const StatusIcon = ({ status }: { status?: string }) => {
    if (status === 'passed') return <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />;
    if (status === 'in_progress') return <Circle className="w-4 h-4 text-primary flex-shrink-0 animate-pulse" />;
    return <Lock className="w-3.5 h-3.5 text-muted-foreground/45 flex-shrink-0" />;
  };

  return (
    <div className="h-full bg-card border-r-4 border-[#2c1e14] flex flex-col overflow-hidden">
      {/* Subject tabs */}
      <div className="p-3 border-b-2 border-[#2c1e14] bg-secondary/50">
        <div className="flex gap-1.5 items-center justify-between min-h-[52px] py-1 w-full">
          {subjects.map((s) => {
            const SIcon = SUBJECT_ICONS[s.name] || Calculator;
            const isActive = s.id === activeSubjectId;
            const displayName = SUBJECT_DISPLAY_NAMES[s.name] || s.name;
            return (
              <button
                key={s.id}
                onClick={() => { setActiveSubjectId(s.id); setCurrentSubject(s.id); }}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white btn-3d-primary shadow-sm h-10 border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 h-9 border border-transparent mb-1'
                }`}
              >
                <SIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:block truncate">{displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject header + progress */}
      <div className="p-4 border-b-2 border-[#2c1e14] bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">{activeSubject?.name}</p>
            <p className="text-xs text-muted-foreground font-semibold">{passedCount}/{topics.length} chapters passed</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3.5 bg-muted rounded-full overflow-hidden border border-border/40 p-0.5">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
            style={{ width: topics.length ? `${(passedCount / topics.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto py-3 px-2 bg-secondary/30">
        {topics.map((topic, i) => {
          const isActive = pathname?.includes(topic.id);
          const isLocked = topic.status === 'locked';
          return (
            <button
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl mb-2 text-left transition-all border group ${
                isActive
                  ? 'bg-primary/5 border-primary/25 shadow-sm translate-x-0.5'
                  : isLocked
                  ? 'opacity-40 cursor-not-allowed border-transparent'
                  : 'bg-card border-border hover:border-primary/20 cursor-pointer shadow-sm hover:-translate-y-0.5'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                topic.status === 'passed' ? 'bg-accent/10 text-accent' :
                topic.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`flex-1 text-xs md:text-sm font-bold leading-tight ${
                isActive ? 'text-primary' : isLocked ? 'text-muted-foreground/60' : 'text-foreground group-hover:text-primary'
              }`}>
                {topic.title}
              </span>
              <StatusIcon status={topic.status} />
            </button>
          );
        })}
        {topics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm font-semibold">No chapters found</div>
        )}
      </div>
    </div>
  );
}
