'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Trophy, Award, Building, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const performSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/public/results?search=${encodeURIComponent(searchTerm.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.programs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    startTransition(() => {
      performSearch(val);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Public Results Search
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search by student name, registration number, chest number, school, or event code
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="E.g. Ananya, REG-2001, BN-101, Silver Hills, Mohiniyattam..."
          className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white font-medium text-slate-800"
        />
      </div>

      {/* Results Listing */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Searching records...</div>
        ) : query && results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No published results found matching &quot;{query}&quot;. Verify your query or check back once results are published.
          </div>
        ) : (
          results.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {prog.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {prog.category?.name} • {prog.section}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{prog.name}</h3>
                </div>

                <Link
                  href={`/results/${prog.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Full Event Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Positions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <th className="py-2 px-3 text-center">Rank</th>
                      <th className="py-2 px-3 text-center">Position</th>
                      <th className="py-2 px-3 text-center">Grade</th>
                      <th className="py-2 px-3 font-mono">Chest No</th>
                      <th className="py-2 px-4">Contestant</th>
                      <th className="py-2 px-4">Institution</th>
                      <th className="py-2 px-3 text-center">Score</th>
                      <th className="py-2 px-3 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prog.result?.positions.map((pos: any, idx: number) => (
                      <tr
                        key={idx}
                        className={pos.position !== 'None' ? 'bg-indigo-50/20 font-semibold' : ''}
                      >
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                          {pos.rank <= 50 ? pos.rank : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              pos.position === '1st'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : pos.position === '2nd'
                                ? 'bg-slate-200 text-slate-800'
                                : pos.position === '3rd'
                                ? 'bg-orange-100 text-orange-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {pos.position !== 'None' ? pos.position : '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              pos.grade === 'A'
                                ? 'text-emerald-700 bg-emerald-50'
                                : pos.grade === 'B'
                                ? 'text-blue-700 bg-blue-50'
                                : pos.grade === 'C'
                                ? 'text-amber-700 bg-amber-50'
                                : 'text-slate-400'
                            }`}
                          >
                            {pos.grade !== 'None' ? pos.grade : '-'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {pos.entry.chestNo}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          <div>
                            {pos.entry.members.map((m: any) => m.participant.name).join(', ')}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {pos.entry.members
                              .map((m: any) => m.participant.registrationNo)
                              .join(', ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {pos.entry.institution.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                          {pos.finalScore > 0 ? pos.finalScore.toFixed(2) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                          {pos.totalPoints}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-400">
          Loading search portal...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
