'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ShieldCheck, ArrowRight, Lock, Mail, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid login credentials');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          FestResult OS
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          CBSE Sahodaya Kalotsav 2026 • Official Scoring & Administration Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@festival.org"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Cards */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Role Switcher (Demo / Testing)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@festival.org', 'admin123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold text-slate-800 block">Super Admin</span>
                <span className="text-[10px] text-slate-500">Full System Control</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('program@festival.org', 'program123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold text-slate-800 block">Program Admin</span>
                <span className="text-[10px] text-slate-500">Program & Entries</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('judge@festival.org', 'judge123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold text-slate-800 block">Judge / Operator</span>
                <span className="text-[10px] text-slate-500">Mark Entry Grid</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('verifier@festival.org', 'verifier123')}
                className="p-2 text-left bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="font-bold text-slate-800 block">Verification Officer</span>
                <span className="text-[10px] text-slate-500">Scrutiny & Approval</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to Public Festival Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

