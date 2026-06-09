'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api';
import { StudentDashboard, TopicProgressItem } from '@/types';
import BloomRadarChart from '@/components/dashboard/BloomRadarChart';
import ProgressTimeline from '@/components/dashboard/ProgressTimeline';
import SubjectHeatmap from '@/components/dashboard/SubjectHeatmap';
import AttemptHistoryTable from '@/components/dashboard/AttemptHistoryTable';
import WeakAreasCard from '@/components/dashboard/WeakAreasCard';
import TimMascot from '@/components/common/TimMascot';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, BookOpen, Target, Award, Lock, Star, ChevronRight, 
  Atom, FlaskConical, Calculator, X, BookOpenText, Trophy 
} from 'lucide-react';
import Link from 'next/link';

const SUBJECT_ICONS: Record<string, any> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Mathematics: Calculator,
};

const SUBJECT_GRADIENTS: Record<string, string> = {
  Physics: 'from-blue-500 to-sky-400',
  Chemistry: 'from-emerald-500 to-teal-400',
  Mathematics: 'from-amber-500 to-orange-500',
};

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/30 hover:-translate-y-0.5 transition-all">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-2.5`}>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-xl font-extrabold text-foreground leading-none">{value}</p>
      <p className="text-muted-foreground text-xs font-bold mt-1.5">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'analytics'>('roadmap');
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [selectedTopic, setSelectedTopic] = useState<TopicProgressItem | null>(null);

  const { data, isLoading, error } = useQuery<StudentDashboard>({
    queryKey: ['dashboard', user?.id],
    queryFn: () => apiClient.get(`/api/dashboard/student/${user?.id}`).then((r) => r.data),
    enabled: !!user?.id,
  });

  // Extract unique subjects from topic progress
  const subjectsList = data 
    ? Array.from(new Set(data.topic_progress.map(t => t.subject)))
    : ['Physics', 'Chemistry', 'Mathematics'];

  // Default subject set
  useEffect(() => {
    if (subjectsList.length && !subjectsList.includes(selectedSubject)) {
      setSelectedSubject(subjectsList[0]);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-muted rounded-2xl h-24" />)}
        </div>
        <div className="bg-muted rounded-3xl h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Target className="w-12 h-12 mb-3 opacity-40 animate-float" />
        <p className="font-semibold">Could not load dashboard data</p>
      </div>
    );
  }

  const avgBloom = ((data.bloom_scores.remember + data.bloom_scores.understand + data.bloom_scores.apply) / 3).toFixed(1);

  // Filter topics for the active subject
  const filteredTopics = data.topic_progress.filter(
    (t) => t.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const passedCount = filteredTopics.filter((t) => t.status === 'passed').length;
  const subjectProgressPct = filteredTopics.length 
    ? Math.round((passedCount / filteredTopics.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dashboard Toggle Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-foreground font-outfit">Welcome back, {data.name.split(' ')[0]}! 🚀</h1>
          <p className="text-muted-foreground text-xs font-bold mt-1">Ready for today&apos;s adaptive learning quest?</p>
        </div>

        {/* Playful Pill Toggle */}
        <div className="flex bg-muted/65 p-1 rounded-2xl border border-border/80 w-fit">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-primary text-white btn-3d-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Roadmap
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-primary text-white btn-3d-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Analytics
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'roadmap' ? (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={BookOpen} label="Total Chapters Passed" value={`${data.passed_topics}/${data.total_topics}`} color="bg-primary/10" />
              <StatCard icon={TrendingUp} label="Mastery Score" value={`${avgBloom}/10`} color="bg-accent/10" />
              <StatCard icon={Target} label="Completed Quests" value={data.recent_attempts.length} color="bg-green-500/10" />
              <StatCard icon={Award} label="Review Topics" value={data.weak_areas.length} color="bg-amber-500/10" />
            </div>

            {/* Subject RoadMap Card */}
            <div className="bg-card border border-border shadow-card rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6">
              {/* Subject Sidebar Selector (Inline) */}
              <div className="md:w-60 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {subjectsList.map((subj) => {
                  const Icon = SUBJECT_ICONS[subj] || Calculator;
                  const gradient = SUBJECT_GRADIENTS[subj] || 'from-indigo-500 to-violet-500';
                  const isActive = subj === selectedSubject;
                  return (
                    <button
                      key={subj}
                      onClick={() => { setSelectedSubject(subj); setSelectedTopic(null); }}
                      className={`flex-1 md:flex-initial flex items-center gap-2.5 p-3 rounded-2xl text-left text-sm font-black transition-all border ${
                        isActive
                          ? 'bg-primary text-white btn-3d-primary border-primary/20'
                          : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground hover:bg-muted/65 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isActive ? 'bg-white/20' : gradient} flex items-center justify-center text-white`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{subj}</span>
                    </button>
                  );
                })}

                {/* Quick Mascot Tip Box */}
                <div className="hidden md:block mt-auto p-4 bg-secondary rounded-2xl border border-border/80 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <TimMascot size={36} mood="happy" />
                    <span className="text-xs font-black text-primary">TIM Guide</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                    Complete your active chapters (orange stars) to unlock subsequent milestones!
                  </p>
                </div>
              </div>

              {/* Staggered Learning Roadmap journey */}
              <div className="flex-1 bg-secondary/35 rounded-3xl border border-border/70 p-6 min-h-[500px] flex flex-col items-center justify-start relative overflow-hidden">
                {/* Subject name overlay header */}
                <div className="w-full flex items-center justify-between border-b border-border/80 pb-4 mb-8">
                  <div>
                    <h3 className="font-extrabold text-foreground text-base">{selectedSubject} roadmap</h3>
                    <p className="text-xs text-muted-foreground font-semibold">{passedCount} of {filteredTopics.length} milestones conquered ({subjectProgressPct}%)</p>
                  </div>
                  <div className="w-32 h-3 bg-muted rounded-full overflow-hidden border border-border/50 p-0.5">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${subjectProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Vertical road line */}
                <div className="absolute top-24 bottom-12 left-1/2 -translate-x-1/2 w-2 border-l-4 border-dashed border-primary/20 -z-0" />

                {/* Roadmap Nodes */}
                <div className="relative w-full max-w-md flex flex-col items-center gap-10 py-4 z-10">
                  {filteredTopics.map((topic, index) => {
                    const isPassed = topic.status === 'passed';
                    const isCurrent = topic.status === 'in_progress';
                    const isLocked = topic.status === 'locked';

                    // Wavy translation styling: left, center, right, center, left
                    const waveIndex = index % 4;
                    const translateClass = 
                      waveIndex === 0 ? '-translate-x-12 sm:-translate-x-16' : 
                      waveIndex === 2 ? 'translate-x-12 sm:translate-x-16' : '';

                    return (
                      <div key={topic.topic_id} className={`relative ${translateClass} flex flex-col items-center group`}>
                        {/* Node circle */}
                        <button
                          onClick={() => {
                            if (!isLocked) {
                              setSelectedTopic(selectedTopic?.topic_id === topic.topic_id ? null : topic);
                            }
                          }}
                          className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                            isPassed 
                              ? 'bg-gradient-to-br from-orange-400 to-primary text-white border-primary/20 btn-3d-primary shadow-md'
                              : isCurrent
                              ? 'bg-accent text-white animate-pulse-glow btn-3d-accent border-accent/20 border-b-[5px] scale-110 shadow-lg'
                              : 'bg-muted/70 text-muted-foreground/45 border-border/80 cursor-not-allowed cursor-default border-b-[5px]'
                          }`}
                        >
                          {isPassed ? (
                            <Star className="w-6 h-6 fill-white" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <Award className="w-7 h-7 fill-white/10" />
                          )}
                        </button>

                        {/* Title tooltip on hover */}
                        <div className="absolute top-16 bg-foreground text-background text-[10px] font-black rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-30">
                          {topic.topic_title}
                        </div>

                        {/* Mascot next to active node */}
                        {isCurrent && (
                          <div className="absolute left-20 -top-4 flex items-center z-20 pointer-events-none">
                            <TimMascot size={46} mood="cheering" speechBubble="Tap me!" />
                          </div>
                        )}

                        {/* Active topic popup dialog detail card */}
                        <AnimatePresence>
                          {selectedTopic?.topic_id === topic.topic_id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className="absolute top-20 w-72 bg-card border border-border shadow-card rounded-3xl p-5 z-40 text-center"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  isPassed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-accent/10 text-accent border-accent/20'
                                }`}>
                                  {isPassed ? 'Completed' : 'Active Chapter'}
                                </span>
                                <button onClick={() => setSelectedTopic(null)} className="text-muted-foreground hover:text-foreground">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <h4 className="font-extrabold text-foreground text-sm font-display mb-2">{topic.topic_title}</h4>
                              
                              {topic.best_score > 0 && (
                                <p className="text-xs text-primary font-bold mb-3">Best Score: {topic.best_score.toFixed(1)} / 10</p>
                              )}

                              <div className="flex flex-col gap-2 mt-4">
                                <Link
                                  href={`/learn/${topic.topic_id}`}
                                  className="w-full bg-accent hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 btn-3d-accent"
                                >
                                  <BookOpenText className="w-3.5 h-3.5" /> Study Room
                                </Link>
                                <Link
                                  href={`/test/${topic.topic_id}`}
                                  className="w-full bg-primary hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 btn-3d-primary"
                                >
                                  <Trophy className="w-3.5 h-3.5" /> Take Quest
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={BookOpen} label="Topics Passed" value={`${data.passed_topics}/${data.total_topics}`} color="bg-primary/10" />
              <StatCard icon={TrendingUp} label="Avg Bloom Score" value={`${avgBloom}/10`} color="bg-indigo-500/10" />
              <StatCard icon={Target} label="Recent Attempts" value={data.recent_attempts.length} color="bg-accent/10" />
              <StatCard icon={Award} label="Weak Areas" value={data.weak_areas.length} color="bg-violet-500/10" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
                <h2 className="text-sm md:text-base font-extrabold text-foreground mb-4 font-outfit">Bloom&apos;s Taxonomy Performance</h2>
                <BloomRadarChart scores={data.bloom_scores} />
              </div>
              <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
                <h2 className="text-sm md:text-base font-extrabold text-foreground mb-4 font-outfit">Progress Timeline</h2>
                <ProgressTimeline topicProgress={data.topic_progress} />
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
              <h2 className="text-sm md:text-base font-extrabold text-foreground mb-4 font-outfit">Subject Heatmap</h2>
              <SubjectHeatmap topicProgress={data.topic_progress} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card border border-border shadow-sm rounded-2xl p-5">
                <h2 className="text-sm md:text-base font-extrabold text-foreground mb-4 font-outfit">Recent Attempts</h2>
                <AttemptHistoryTable attempts={data.recent_attempts} />
              </div>
              <div className="bg-card border border-border shadow-sm rounded-2xl p-5">
                <h2 className="text-sm md:text-base font-extrabold text-foreground mb-4 font-outfit">Weak Areas</h2>
                <WeakAreasCard weakAreas={data.weak_areas} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
