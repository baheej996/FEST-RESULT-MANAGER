'use client';

import React, { useEffect, useState } from 'react';
import LeaderboardPodium from '@/components/leaderboard-podium';
import { Trophy, Medal, Award, RefreshCw, Printer, Shield } from 'lucide-react';

export default function PublicLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStandings = () => {
    setLoading(true);
    fetch('/api/public/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setFestival(data.festival);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Official Championship Standings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Overall School Championship Leaderboard
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Calculated automatically from all verified and published competition items. Updated in real-time.
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && <LeaderboardPodium topThree={leaderboard.slice(0, 3)} />}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            All Participating Institutions ({leaderboard.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={fetchStandings}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-100/60 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4 w-28">School Code</th>
              <th className="py-3 px-4 min-w-[240px]">Institution Name</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4 text-center">1st</th>
              <th className="py-3 px-4 text-center">2nd</th>
              <th className="py-3 px-4 text-center">3rd</th>
              <th className="py-3 px-4 text-center">Grade A</th>
              <th className="py-3 px-4 text-center font-bold text-slate-900 bg-indigo-50/50 border-l border-slate-200">
                Total Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">Loading standings...</td>
              </tr>
            ) : (
              leaderboard.map((item) => (
                <tr
                  key={item.institutionId}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    item.rank === 1
                      ? 'bg-amber-50/30 font-bold'
                      : item.rank === 2
                      ? 'bg-slate-50/50 font-semibold'
                      : item.rank === 3
                      ? 'bg-orange-50/20 font-semibold'
                      : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono ${
                        item.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : item.rank === 3
                          ? 'bg-amber-200 text-amber-900'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.district || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {item.firstCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {item.secondCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                    {item.thirdCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700">
                    {item.gradeACount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-indigo-900 text-base bg-indigo-50/40 border-l border-slate-200">
                    {item.totalPoints}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tie-breaker rules note */}
      <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <span className="font-bold text-slate-800 block">Championship Tie-Breaking Criteria:</span>
        <p>
          1. Highest Total Points • 2. Most 1st Positions Won • 3. Most 2nd Positions Won • 4. Most 3rd Positions Won • 5. Highest Grade A Count.
        </p>
      </div>
    </div>
  );
}

