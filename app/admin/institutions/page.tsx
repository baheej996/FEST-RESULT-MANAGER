'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { Building2, Plus, Upload, Download, Search, Edit2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInst, setNewInst] = useState({ code: '', name: '', district: '', category: '', contactPerson: '', contactPhone: '' });

  const fetchInstitutions = () => {
    setLoading(true);
    fetch(`/api/institutions?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setInstitutions(data.institutions || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInstitutions();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInst),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewInst({ code: '', name: '', district: '', category: '', contactPerson: '', contactPhone: '' });
        fetchInstitutions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportXLSX = () => {
    const data = institutions.map((inst) => ({
      'Code': inst.code,
      'Institution Name': inst.name,
      'District': inst.district,
      'Category': inst.category,
      'Contact Person': inst.contactPerson,
      'Phone': inst.contactPhone,
      'Total Points': inst.pointsSummary?.totalPoints || 0,
      '1st Places': inst.pointsSummary?.firstCount || 0,
      'Rank': inst.pointsSummary?.rank || '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Institutions');
    XLSX.writeFile(wb, 'Festival_Institutions.xlsx');
  };

  return (
    <>
      <AdminTopbar
        title="Institution Management"
        subtitle="Manage participating schools, points tally and team managers"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by school name, code, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportXLSX}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Institution
            </button>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4 min-w-[220px]">Institution Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4 text-center">Participants</th>
                <th className="py-3 px-4 text-center">Championship Points</th>
                <th className="py-3 px-4 text-center">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading institutions...</td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No institutions found.</td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                        {inst.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      {inst.name}
                      <span className="text-[10px] text-slate-400 block font-normal">{inst.category || 'School'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {inst.district || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{inst.contactPerson || '-'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{inst.contactPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                      {inst._count?.participants || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-indigo-700 text-sm">
                      {inst.pointsSummary?.totalPoints || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-800">
                      {inst.pointsSummary?.rank ? `#${inst.pointsSummary.rank}` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for adding institution */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Register New Institution</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Code</label>
                  <input
                    type="text"
                    required
                    placeholder="SCH-106"
                    value={newInst.code}
                    onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kendriya Vidyalaya"
                    value={newInst.name}
                    onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District / Location</label>
                  <input
                    type="text"
                    placeholder="Kozhikode"
                    value={newInst.district}
                    onChange={(e) => setNewInst({ ...newInst, district: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Principal / Manager"
                      value={newInst.contactPerson}
                      onChange={(e) => setNewInst({ ...newInst, contactPerson: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98..."
                      value={newInst.contactPhone}
                      onChange={(e) => setNewInst({ ...newInst, contactPhone: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
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
                    Save Institution
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

