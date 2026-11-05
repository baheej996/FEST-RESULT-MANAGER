'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { Users2, Plus, Download, Search, CheckCircle, Award } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInst, setSelectedInst] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPart, setNewPart] = useState({ registrationNo: '', name: '', institutionId: '', category: 'Senior', gradeClass: 'Class 10', gender: 'Female' });

  const fetchParticipants = () => {
    setLoading(true);
    fetch(`/api/participants?institutionId=${selectedInst}&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data.participants || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetch('/api/institutions')
      .then((res) => res.json())
      .then((data) => setInstitutions(data.institutions || []));
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [selectedInst, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPart),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewPart({ registrationNo: '', name: '', institutionId: '', category: 'Senior', gradeClass: 'Class 10', gender: 'Female' });
        fetchParticipants();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportXLSX = () => {
    const data = participants.map((p) => ({
      'Registration No': p.registrationNo,
      'Participant Name': p.name,
      'Institution': p.institution?.name,
      'School Code': p.institution?.code,
      'Category': p.category,
      'Class': p.gradeClass,
      'Gender': p.gender,
      'Competitions Registered': p.entryMembers?.length || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, 'Festival_Participants.xlsx');
  };

  return (
    <>
      <AdminTopbar
        title="Participant Database"
        subtitle="Manage contestant registrations, student categories and event history"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student name or registration no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="">All Institutions</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} - {inst.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleExportXLSX}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              Register Participant
            </button>
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-32">Reg. No</th>
                <th className="py-3 px-4 min-w-[200px]">Student Name</th>
                <th className="py-3 px-4 min-w-[200px]">Institution</th>
                <th className="py-3 px-4">Category & Class</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4 text-center">Registered Events</th>
                <th className="py-3 px-4 text-center">Positions Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading participants...</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No participants found.</td>
                </tr>
              ) : (
                participants.map((p) => {
                  const wonEvents = p.entryMembers?.filter((em: any) => em.entry?.resultPosition && em.entry?.resultPosition.position !== 'None') || [];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {p.registrationNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <div>{p.institution?.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{p.institution?.code}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <div>{p.category}</div>
                        <span className="text-[10px] text-slate-400">{p.gradeClass}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.gender || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                        {p.entryMembers?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        {wonEvents.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            {wonEvents.map((w: any) => w.entry.resultPosition.position).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900 mb-4">Register Candidate</h3>
              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registration No</label>
                  <input
                    type="text"
                    required
                    placeholder="REG-2011"
                    value={newPart.registrationNo}
                    onChange={(e) => setNewPart({ ...newPart, registrationNo: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Kavya Mohan"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution</label>
                  <select
                    required
                    value={newPart.institutionId}
                    onChange={(e) => setNewPart({ ...newPart, institutionId: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.code} - {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newPart.category}
                      onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    >
                      <option value="Sub-Junior">Sub-Junior</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class</label>
                    <input
                      type="text"
                      placeholder="Class 10"
                      value={newPart.gradeClass}
                      onChange={(e) => setNewPart({ ...newPart, gradeClass: e.target.value })}
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
                    Register Candidate
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

