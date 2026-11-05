'use client';

import { Bell, Sparkles } from 'lucide-react';

interface TopbarProps {
  festivalName?: string;
  festivalCode?: string;
  title: string;
  subtitle?: string;
}

export default function AdminTopbar({
  festivalName = 'Sahodaya Kalotsav 2026',
  festivalCode = 'SK2026',
  title,
  subtitle,
}: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-medium text-slate-500">{subtitle}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Festival Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full border border-slate-200/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-800">{festivalName}</span>
          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            {festivalCode}
          </span>
        </div>

        {/* Database Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-indigo-50/60 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-medium">Active Database Engine</span>
        </div>
      </div>
    </header>
  );
}

