'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, ArrowRight, Search, CheckCircle2, Trophy } from 'lucide-react';

export default function PublicResultsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/results')
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setLoading(false);
      });
  }, []);

  const filtered = programs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Official Published Results
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Scrutinized and approved competition result sheets
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Filter by event name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
            Loading published results...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
            No published results match your filter.
          </div>
        ) : (
          filtered.map((prog) => {
            const firstPlace = prog.result?.positions.find((p: any) => p.position === '1st');
            const winnerName =
              firstPlace?.entry.members.map((m: any) => m.participant.name).join(', ') || 'Contestant';
            const winnerSchool = firstPlace?.entry.institution.name || '';

            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {prog.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Published
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">{prog.name}</h3>
                  <p className="text-xs text-slate-500">
                    {prog.category?.name} • {prog.section}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" /> 1st Position
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {firstPlace?.entry.chestNo ? `Chest #${firstPlace.entry.chestNo}` : ''}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">{winnerName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{winnerSchool}</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {prog.result?.positions.length || 0} participants
                  </span>
                  <Link
                    href={`/results/${prog.id}`}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View Official Sheet <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

