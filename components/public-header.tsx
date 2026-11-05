'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Search, Award, BarChart3, ShieldCheck, Flame } from 'lucide-react';

export default function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Live Standings', href: '/leaderboard', icon: Trophy },
    { label: 'Published Results', href: '/results', icon: Award },
    { label: 'Search Results', href: '/search', icon: Search },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      {/* Live Notice Bar */}
      <div className="bg-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Official Live Portal — Sahodaya Kalotsav 2026 Results & Championship Standings</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-300 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">Sahodaya Kalotsav</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                2026
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Official Festival Results Portal
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Portal Login Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Official Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

