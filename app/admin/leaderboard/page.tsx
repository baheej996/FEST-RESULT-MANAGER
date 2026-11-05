'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import LeaderboardPodium from '@/components/leaderboard-podium';
import { Trophy, RefreshCw, Download, Medal } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = () => {
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
    fetchBoard();
  }, []);

  const handleExportXLSX = () => {
    const data = leaderboard.map((row) => ({
      'Rank': row.rank,
      'School Code': row.code,
      'Institution Name': row.name,
      'District': row.district,
      'Total Points': row.totalPoints,
      '1st Positions': row.firstCount,
      '2nd Positions': row.secondCount,
      '3rd Positions': row.thirdCount,
      'Grade A Awards': row.gradeACount,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Championship_Leaderboard');
    XLSX.writeFile(wb, 'Sahodaya_Kalotsav_Leaderboard.xlsx');
  };

  return (
    <>
      <AdminTopbar
        title="Championship Leaderboard"
        subtitle="Live institution point standings, gold podium and tie-breakers"
        festivalName={festival?.name}
        festivalCode={festival?.code}
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Top Podium Display */}
        {leaderboard.length >= 3 && <LeaderboardPodium topThree={leaderboard.slice(0, 3)} />}

        {/* Leaderboard Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Consolidated Institution Rankings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Excel
              </button>
              <button
                onClick={fetchBoard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Standings
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/60 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-16 text-center">Rank</th>
                <th className="py-3 px-4 w-28">School Code</th>
                <th className="py-3 px-4 min-w-[220px]">Institution Name</th>
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
                leaderboard.map((item, idx) => (
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
      </main>
    </>
  );
}

