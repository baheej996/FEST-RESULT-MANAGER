'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { Award, Plus, Search, CheckCircle, Edit3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProg, setNewProg] = useState({
    code: '',
    name: '',
    categoryId: '',
    type: 'INDIVIDUAL',
    section: 'Category 3 (Classes 8-10)',
    maxMarks: '100',
    judgeCount: '3',
    scoringMethod: 'AVERAGE',
  });

  const fetchPrograms = () => {
    setLoading(true);
    fetch(`/api/programs?categoryId=${selectedCat}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setCategories(data.categories || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrograms();
  }, [selectedCat, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProg),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProg({
          code: '',
          name: '',
          categoryId: categories[0]?.id || '',
          type: 'INDIVIDUAL',
          section: 'Category 3 (Classes 8-10)',
          maxMarks: '100',
          judgeCount: '3',
          scoringMethod: 'AVERAGE',
        });
        fetchPrograms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Competition & Program Management"
        subtitle="Configure scoring rules, judges count, and category events"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by program name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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

            <button
              onClick={() => {
                if (categories.length > 0 && !newProg.categoryId) {
                  setNewProg((prev) => ({ ...prev, categoryId: categories[0].id }));
                }
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Program
            </button>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-28">Item Code</th>
                <th className="py-3 px-4 min-w-[200px]">Program Title</th>
                <th className="py-3 px-4">Category & Section</th>
                <th className="py-3 px-4 text-center">Format</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Judges</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading programs...</td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No programs found.</td>
                </tr>
              ) : (
                programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {prog.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm block">{prog.name}</span>
                      <span className="text-[10px] text-slate-400">{prog._count?.entries || 0} Registered Contestants</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div>{prog.category?.name}</div>
                      <span className="text-[10px] text-slate-400">{prog.section}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-700">
                        {prog.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {prog.maxMarks}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {prog.judgeCount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
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
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Enter Marks</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Program Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Create Competition Event</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
                    <input
                      type="text"
                      required
                      placeholder="PROG-107"
                      value={newProg.code}
                      onChange={(e) => setNewProg({ ...newProg, code: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      required
                      value={newProg.categoryId}
                      onChange={(e) => setNewProg({ ...newProg, categoryId: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Kuchipudi, Western Vocal Solo"
                    value={newProg.name}
                    onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Format Type</label>
                    <select
                      value={newProg.type}
                      onChange={(e) => setNewProg({ ...newProg, type: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="INDIVIDUAL">Individual Event</option>
                      <option value="GROUP">Group Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Section</label>
                    <input
                      type="text"
                      placeholder="Category 3 (Classes 8-10)"
                      value={newProg.section}
                      onChange={(e) => setNewProg({ ...newProg, section: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                    <input
                      type="number"
                      value={newProg.maxMarks}
                      onChange={(e) => setNewProg({ ...newProg, maxMarks: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Judges Count</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newProg.judgeCount}
                      onChange={(e) => setNewProg({ ...newProg, judgeCount: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scoring Mode</label>
                    <select
                      value={newProg.scoringMethod}
                      onChange={(e) => setNewProg({ ...newProg, scoringMethod: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="AVERAGE">Average</option>
                      <option value="TOTAL">Total Sum</option>
                      <option value="DROP_HIGH_LOW">Drop High/Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                  >
                    Create Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

