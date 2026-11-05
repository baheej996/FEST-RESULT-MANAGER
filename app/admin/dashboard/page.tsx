'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTopbar from '@/components/admin-topbar';
import AnalyticsCards from '@/components/analytics-cards';
import {
  Trophy,
  Award,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading festival dashboard...</p>
        </div>
      </div>
    );
  }

  const { counts, leaderboard, recentPublications, categoryStats, festival } = data;

  const completionPercentage =
    counts.totalPrograms > 0
      ? Math.round((counts.completedPrograms / counts.totalPrograms) * 100)
      : 0;

  const chartData = leaderboard.slice(0, 5).map((inst: any) => ({
    name: inst.code,
    fullName: inst.name,
    points: inst.totalPoints,
  }));

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <>
      <AdminTopbar
        title="Operations Control Dashboard"
        subtitle="Real-time festival analytics & workflow monitoring"
        festivalName={festival?.name}
        festivalCode={festival?.code}
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Top 7 Stat Metrics */}
        <AnalyticsCards counts={counts} />

        {/* Middle Visual Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institution Points Leaderboard Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Top 5 Institutions Leaderboard (Points)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live aggregated championship tally based on published results
                </p>
              </div>
              <Link
                href="/admin/leaderboard"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Full Standings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs">
                            <p className="font-bold">{d.fullName}</p>
                            <p className="text-indigo-300 font-mono mt-0.5">{d.points} Championship Points</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="points" radius={[6, 6, 0, 0]}>
                    {chartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Program Completion Progress Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Festival Completion Status
              </h3>
              <p className="text-xs text-slate-500">
                Programs completed and officially published
              </p>

              <div className="mt-6 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">
                  {completionPercentage}%
                </span>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {counts.completedPrograms} of {counts.totalPrograms} Programs Published
                </p>

                <div className="w-4/5 mx-auto bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Mark Entry
                </span>
                <span className="font-bold text-slate-800 font-mono">{counts.pendingMarkEntries}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" /> Ready for Verification
                </span>
                <span className="font-bold text-slate-800 font-mono">{counts.awaitingVerification}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Publications & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Result Publications */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recently Published Results</h3>
                <p className="text-xs text-slate-500 mt-0.5">Live on public portal</p>
              </div>
              <Link
                href="/admin/verification"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Verification Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-2.5 px-4">Program</th>
                    <th className="py-2.5 px-4">Category & Section</th>
                    <th className="py-2.5 px-4">1st Position Winner</th>
                    <th className="py-2.5 px-4">Institution</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPublications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No results published yet.
                      </td>
                    </tr>
                  ) : (
                    recentPublications.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{item.programName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{item.programCode}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.category} • {item.section}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {item.winner}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {item.winnerInstitution}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/results/${item.id}`}
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Category breakdown */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3">Quick Operational Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/admin/mark-entry"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Enter Judge Marks (Keyboard Grid)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/verification"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                    Scrutinize & Approve Results
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/reports"
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-600" />
                    Print Official Result Sheets
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Events by Category
              </h4>
              <div className="space-y-2">
                {categoryStats.map((cat: any) => (
                  <div key={cat.code} className="flex items-center justify-between text-xs text-slate-600">
                    <span>{cat.name}</span>
                    <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {cat.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

