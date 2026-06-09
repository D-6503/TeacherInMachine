'use client';
import { useState } from 'react';
import { Topic, Video } from '@/types';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PDFViewer';
import ConceptSummary from './ConceptSummary';
import AIChatTab from './AIChatTab';
import { PlayCircle, FileText, BookOpen, MessageSquare } from 'lucide-react';

interface Props { topic: Topic; videos: Video[]; }

const TABS = [
  { id: 'video', label: 'Video Lecture', icon: PlayCircle },
  { id: 'pdf', label: 'PDF Notes', icon: FileText },
  { id: 'summary', label: 'AI Summary', icon: BookOpen },
  { id: 'chat', label: 'Ask AI Tutor', icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]['id'];

export default function StudyModeTabs({ topic, videos }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('video');

  return (
    <div className="bg-card border border-border shadow-card rounded-3xl overflow-hidden">
      {/* Tab bar (Pill layout) */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-secondary/50 items-center">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs md:text-sm font-black transition-all ${
                isActive
                  ? 'bg-primary text-white btn-3d-primary rounded-2xl shadow-sm border border-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-2xl border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-6 min-h-[420px] bg-card">
        {activeTab === 'video' && <VideoPlayer videos={videos} />}
        {activeTab === 'pdf' && <PDFViewer pdfUrl={topic.pdf_url} />}
        {activeTab === 'summary' && <ConceptSummary summary={topic.summary} />}
        {activeTab === 'chat' && <AIChatTab topicId={topic.id} />}
      </div>
    </div>
  );
}
