'use client';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { AdminOverview } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, colorBg, colorIcon, sub }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
      <div className={`w-10 h-10 rounded-xl ${colorBg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${colorIcon}`} />
      </div>
      <p className="text-2xl font-bold text-foreground font-outfit">{value}</p>
      <p className="text-muted-foreground text-sm mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-muted-foreground/70 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-lg">
        <p className="text-foreground text-xs font-semibold">{label}</p>
        <p className="text-primary text-sm font-bold mt-0.5">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: () => apiClient.get('/api/admin/overview').then((r) => r.data),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted/60 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const chartData = Object.entries(data.subject_pass_rates).map(([subject, rate]) => ({
    subject, rate,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-outfit">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={data.total_students}
          sub={`${data.active_students} active`}
          colorBg="bg-blue-50"
          colorIcon="text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Attempts"
          value={data.total_attempts}
          colorBg="bg-purple-50"
          colorIcon="text-purple-600"
        />
        <StatCard
          icon={BookOpen}
          label="Avg Score"
          value={`${data.avg_score}/10`}
          colorBg="bg-emerald-50"
          colorIcon="text-emerald-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Cheat Flags"
          value={data.pending_cheat_flags}
          colorBg={data.pending_cheat_flags > 0 ? 'bg-red-50' : 'bg-slate-50'}
          colorIcon={data.pending_cheat_flags > 0 ? 'text-red-600' : 'text-slate-500'}
          sub={data.pending_cheat_flags > 0 ? 'Needs review' : 'All clear'}
        />
      </div>

      {/* Subject pass rates chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="text-base font-semibold text-foreground mb-5 font-outfit">Subject Pass Rates (%)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(350 25% 91%)" />
              <XAxis dataKey="subject" tick={{ fill: 'hsl(345 20% 48%)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(345 20% 48%)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" fill="hsl(352 90% 58%)" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
