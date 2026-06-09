'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TopicProgressItem } from '@/types';

interface Props { topicProgress: TopicProgressItem[]; }

export default function ProgressTimeline({ topicProgress }: Props) {
  const passed = topicProgress.filter((t) => t.status === 'passed');

  const data = passed.map((t, i) => ({
    name: t.topic_title.split(' ').slice(0, 2).join(' '),
    topics: i + 1,
    score: Math.round(t.best_score * 10) / 10,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-muted-foreground text-sm font-medium">
        Complete topics to see your progress timeline
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.04)" />
        <XAxis dataKey="name" tick={{ fill: 'hsl(345, 20%, 48%)', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'hsl(345, 20%, 48%)', fontSize: 10, fontWeight: 500 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ 
            background: 'hsl(0, 0%, 100%)', 
            border: '1px solid hsl(350, 25%, 91%)', 
            borderRadius: '12px', 
            color: 'hsl(345, 60%, 12%)', 
            fontSize: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}
          labelStyle={{ color: 'hsl(345, 60%, 12%)', fontWeight: 'bold' }}
        />
        <Area type="monotone" dataKey="topics" stroke="#ff4d6d" fill="url(#progressGrad)" strokeWidth={2} dot={{ fill: '#ff4d6d', r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
