'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminTopbar from '@/components/admin-topbar';
import { Edit3, CheckCircle, Clock, Search, ChevronRight, Award } from 'lucide-react';

export default function MarkEntryListPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/programs')
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = programs.filter((p) => {
    const matchCat = !selectedCat || p.categoryId === selectedCat;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <AdminTopbar
        title="Mark Entry System"
        subtitle="Desktop-optimized keyboard score entry grids"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search program or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4 min-w-[200px]">Program Name</th>
                <th className="py-3 px-4">Category & Section</th>
                <th className="py-3 px-4 text-center">Judges</th>
                <th className="py-3 px-4 text-center">Contestants</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading program records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No programs found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {prog.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm block">{prog.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {prog.type} • Max {prog.maxMarks} Marks
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div>{prog.category?.name}</div>
                      <div className="text-[10px] text-slate-400">{prog.section}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {prog.judgeCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {prog._count?.entries || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          prog.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : prog.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : prog.status === 'MARKS_ENTERED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prog.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/mark-entry/${prog.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-semibold text-xs transition-all shadow-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Open Grid</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
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

