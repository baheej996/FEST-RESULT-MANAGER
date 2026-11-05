'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LeaderboardPodium from '@/components/leaderboard-podium';
import {
  Trophy,
  Search,
  Award,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Building,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicHomePage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [publishedPrograms, setPublishedPrograms] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/public/leaderboard').then((r) => r.json()),
      fetch('/api/public/results').then((r) => r.json()),
    ])
      .then(([lbData, resData]) => {
        setLeaderboard(lbData.leaderboard || []);
        setPublishedPrograms(resData.programs || []);
        setFestival(lbData.festival || resData.festival);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80 pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CBSE Sahodaya School Complex • Annual Arts & Cultural Fest</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {festival?.name || 'Sahodaya Kalotsav 2026'}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-indigo-600" />
              {festival?.venue || 'Silver Hills Central School, Kozhikode'}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Nov 10 – Nov 14, 2026
            </span>
          </div>

          {/* Quick Universal Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mt-8">
            <div className="relative flex items-center shadow-lg shadow-indigo-100/50 rounded-2xl overflow-hidden border-2 border-indigo-100 focus-within:border-indigo-600 transition-all bg-white">
              <Search className="w-5 h-5 text-slate-400 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contestant name, chest number, school name, or event code..."
                className="w-full pl-12 pr-32 py-4 text-sm focus:outline-none font-medium text-slate-800"
              />
              <button
                type="submit"
                className="absolute right-2.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200"
              >
                Search Results
              </button>
            </div>
          </form>

          {/* Key Metrics Banner */}
          <div className="pt-6 grid grid-cols-3 max-w-lg mx-auto gap-4 text-center">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-xl font-extrabold text-slate-900 font-mono">5</span>
              <span className="text-[11px] text-slate-500 block font-medium">Top Schools</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{publishedPrograms.length}</span>
              <span className="text-[11px] text-slate-500 block font-medium">Published Events</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-xl font-extrabold text-indigo-600 font-mono">Live</span>
              <span className="text-[11px] text-slate-500 block font-medium">Championship Tally</span>
            </div>
          </div>
        </div>
      </section>

      {/* Championship Podium & Leaderboard Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Standings</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Overall Championship Leaderboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Top institutions ranked by total points, 1st positions, and Grade A achievements
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50 px-3.5 py-2 rounded-lg border border-indigo-100 transition-colors"
          >
            <span>View Full Leaderboard Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Podium Display */}
        {leaderboard.length >= 3 && <LeaderboardPodium topThree={leaderboard.slice(0, 3)} />}
      </section>

      {/* Recently Published Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Recently Published Results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Official positions and grades announced</p>
          </div>

          <Link
            href="/results"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Results <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedPrograms.map((prog) => {
            const firstPlace = prog.result?.positions.find((p: any) => p.position === '1st');
            const winnerName = firstPlace?.entry.members.map((m: any) => m.participant.name).join(', ') || 'Contestant';
            const winnerSchool = firstPlace?.entry.institution.name || '';
            const winnerChest = firstPlace?.entry.chestNo || '';

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
                      Result Out
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">{prog.name}</h3>
                  <p className="text-xs text-slate-500">
                    {prog.category?.name} • {prog.section}
                  </p>

                  {/* 1st position winner box */}
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-600" /> 1st Position
                      </span>
                      <span className="font-mono font-bold text-amber-800 text-[10px]">
                        Chest #{winnerChest}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{winnerName}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 truncate">{winnerSchool}</div>
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
                    View Result Sheet <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

