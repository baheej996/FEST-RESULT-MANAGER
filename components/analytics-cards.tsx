import React from 'react';
import {
  Users,
  Building,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface StatsProps {
  counts: {
    totalParticipants: number;
    totalInstitutions: number;
    totalPrograms: number;
    completedPrograms: number;
    pendingMarkEntries: number;
    awaitingVerification: number;
    publishedResults: number;
  };
}

export default function AnalyticsCards({ counts }: StatsProps) {
  const cards = [
    {
      title: 'Total Participants',
      value: counts.totalParticipants,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Total Institutions',
      value: counts.totalInstitutions,
      icon: Building,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'Total Programs',
      value: counts.totalPrograms,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      title: 'Completed Programs',
      value: counts.completedPrograms,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Pending Mark Entry',
      value: counts.pendingMarkEntries,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      title: 'Awaiting Verification',
      value: counts.awaitingVerification,
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      title: 'Published Results',
      value: counts.publishedResults,
      icon: Send,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.color} border ${c.border}`}>
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{c.value}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{c.title}</div>
          </div>
        );
      })}
    </div>
  );
}

