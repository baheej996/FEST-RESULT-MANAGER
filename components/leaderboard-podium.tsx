import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

interface PodiumItem {
  rank: number;
  name: string;
  code: string;
  district?: string | null;
  totalPoints: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
  gradeACount: number;
}

interface PodiumProps {
  topThree: PodiumItem[];
}

export default function LeaderboardPodium({ topThree }: PodiumProps) {
  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto my-8">
      {/* 2nd Place (Silver) */}
      {second && (
        <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg shadow-inner">
              2
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-slate-500" />
              Runner-Up
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[44px]">
            {second.name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {second.code} {second.district ? `• ${second.district}` : ''}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">Championship Points</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {second.totalPoints}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span>1st: <strong className="text-slate-800">{second.firstCount}</strong></span>
            <span>2nd: <strong className="text-slate-800">{second.secondCount}</strong></span>
            <span>Grade A: <strong className="text-indigo-600">{second.gradeACount}</strong></span>
          </div>
        </div>
      )}

      {/* 1st Place (Gold) */}
      {first && (
        <div className="order-1 md:order-2 bg-white rounded-2xl border-2 border-amber-300/80 p-7 shadow-md relative overflow-hidden md:-translate-y-3 transition-all hover:border-amber-400">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center font-extrabold text-amber-800 text-xl shadow-inner">
              1
            </span>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200">
              <Trophy className="w-4 h-4 text-amber-600" />
              Overall Champion
            </span>
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-2 min-h-[50px]">
            {first.name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {first.code} {first.district ? `• ${first.district}` : ''}
          </p>

          <div className="mt-6 pt-4 border-t border-amber-100 flex items-baseline justify-between">
            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Total Points</span>
            <span className="text-4xl font-black text-amber-950 tracking-tight">
              {first.totalPoints}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 font-medium">
            <span>1st: <strong className="text-amber-950 font-bold">{first.firstCount}</strong></span>
            <span>2nd: <strong className="text-amber-950 font-bold">{first.secondCount}</strong></span>
            <span>Grade A: <strong className="text-indigo-700 font-bold">{first.gradeACount}</strong></span>
          </div>
        </div>
      )}

      {/* 3rd Place (Bronze) */}
      {third && (
        <div className="order-3 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-700/60"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="w-10 h-10 rounded-xl bg-orange-50 border border-amber-200 flex items-center justify-center font-bold text-amber-900 text-lg shadow-inner">
              3
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-orange-50 text-amber-900 rounded-full flex items-center gap-1 border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Third Place
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 min-h-[44px]">
            {third.name}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            {third.code} {third.district ? `• ${third.district}` : ''}
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">Championship Points</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {third.totalPoints}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span>1st: <strong className="text-slate-800">{third.firstCount}</strong></span>
            <span>2nd: <strong className="text-slate-800">{third.secondCount}</strong></span>
            <span>Grade A: <strong className="text-indigo-600">{third.gradeACount}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

