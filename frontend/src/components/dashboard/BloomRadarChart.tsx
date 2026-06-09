'use client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { BloomScores } from '@/types';

interface Props { scores: BloomScores; }

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-md">
        <p className="text-foreground font-bold">{payload[0]?.payload?.subject}</p>
        <p className="text-primary font-semibold">{payload[0]?.value?.toFixed(1)} / 10</p>
      </div>
    );
  }
  return null;
};

export default function BloomRadarChart({ scores }: Props) {
  const data = [
    { subject: 'Remember', score: scores.remember, fullMark: 10 },
    { subject: 'Understand', score: scores.understand, fullMark: 10 },
    { subject: 'Apply', score: scores.apply, fullMark: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255, 77, 109, 0.15)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(345, 60%, 15%)', fontSize: 11, fontWeight: 600 }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#ff4d6d"
          fill="#ff4d6d"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
