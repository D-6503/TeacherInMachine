'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Topic, Video } from '@/types';
import Link from 'next/link';
import StudyModeTabs from '@/components/learn/StudyModeTabs';
import { ArrowLeft, ArrowRight, BookOpen, Lock } from 'lucide-react';

export default function LearnPage({ params }: { params: { topicId: string } }) {
  const { topicId } = params;

  const { data: topic, isLoading } = useQuery<Topic>({
    queryKey: ['topic', topicId],
    queryFn: () => apiClient.get(`/api/topics/${topicId}`).then((r) => r.data),
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['videos', topicId],
    queryFn: () => apiClient.get(`/api/videos/topics/${topicId}/videos`).then((r) => r.data),
    enabled: !!topicId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-2/3 bg-muted rounded-xl" />
        <div className="h-4 w-1/2 bg-muted rounded-xl" />
        <div className="h-96 bg-muted/60 rounded-2xl" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <BookOpen className="w-12 h-12 mb-3 opacity-40" />
        <p className="font-semibold">Topic not found</p>
      </div>
    );
  }

  if (topic.status === 'locked') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Lock className="w-12 h-12 mb-3 text-muted-foreground" />
        <p className="text-foreground font-bold text-lg">Chapter Locked</p>
        <p className="text-sm mt-1">Complete previous chapters to unlock this one.</p>
        <Link href="/dashboard" className="mt-4 text-primary hover:text-brand-600 font-semibold text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/dashboard" className="hover:text-foreground transition-colors font-medium">Dashboard</Link>
            <span>/</span>
            <span className="text-foreground font-bold">{topic.title}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground font-display leading-tight">{topic.title}</h1>
          {topic.description && <p className="text-muted-foreground text-sm mt-2 max-w-2xl leading-relaxed">{topic.description}</p>}
        </div>
        <Link
          href={`/test/${topicId}`}
          className="flex items-center gap-2 bg-primary hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-card hover:shadow-card-hover hover:-translate-y-0.5 flex-shrink-0"
        >
          Test Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Study tabs */}
      <StudyModeTabs topic={topic} videos={videos} />

      {/* Bottom CTA */}
      <div className="flex justify-center pt-4">
        <Link
          href={`/test/${topicId}`}
          className="flex items-center gap-2 bg-primary hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-card hover:shadow-card-hover hover:-translate-y-0.5 text-base"
        >
          Ready to Test → <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
