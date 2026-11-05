'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { Calendar, Plus, MapPin, CheckCircle, Clock, Archive, Sparkles } from 'lucide-react';

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFest, setNewFest] = useState({
    name: '',
    code: '',
    year: '2026',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    venue: '',
    description: '',
    status: 'ACTIVE',
  });

  const fetchFestivals = () => {
    setLoading(true);
    fetch('/api/festivals')
      .then((res) => res.json())
      .then((data) => {
        setFestivals(data.festivals || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/festivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFest),
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchFestivals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Multi-Festival Management"
        subtitle="Manage festival editions, venues, status and multi-tenant isolation"
      />

      <main className="p-8 space-y-6 flex-1">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Festival Editions</h2>
            <p className="text-xs text-slate-500">All data across schools, participants and programs is strictly partitioned by festival</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Festival Edition
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {festivals.map((fest) => (
            <div
              key={fest.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all ${
                fest.status === 'ACTIVE'
                  ? 'border-indigo-600 ring-2 ring-indigo-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {fest.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fest.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : fest.status === 'UPCOMING'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {fest.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{fest.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  {fest.venue}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs font-mono">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Schools</span>
                  <span className="font-bold text-slate-800">{fest._count?.institutions || 0}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Events</span>
                  <span className="font-bold text-slate-800">{fest._count?.programs || 0}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidates</span>
                  <span className="font-bold text-slate-800">{fest._count?.participants || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Create Festival Edition</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Festival Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sahodaya Kalotsav 2027"
                    value={newFest.name}
                    onChange={(e) => setNewFest({ ...newFest, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Code</label>
                    <input
                      type="text"
                      required
                      placeholder="SK2027"
                      value={newFest.code}
                      onChange={(e) => setNewFest({ ...newFest, code: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Year</label>
                    <input
                      type="number"
                      required
                      value={newFest.year}
                      onChange={(e) => setNewFest({ ...newFest, year: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="Campus Name, City"
                    value={newFest.venue}
                    onChange={(e) => setNewFest({ ...newFest, venue: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newFest.startDate}
                      onChange={(e) => setNewFest({ ...newFest, startDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newFest.endDate}
                      onChange={(e) => setNewFest({ ...newFest, endDate: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                    />
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
                    Create Festival
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

