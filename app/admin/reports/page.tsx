'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import { FileSpreadsheet, Printer, Download, Award, Trophy, Users, Building } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/results')
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
        setLoading(false);
      });
  }, []);

  const exportAllResultsXLSX = () => {
    const rows: any[] = [];
    programs.forEach((prog) => {
      if (!prog.result) return;
      prog.result.positions.forEach((pos: any) => {
        rows.push({
          'Program Code': prog.code,
          'Program Title': prog.name,
          'Category': prog.category?.name,
          'Section': prog.section,
          'Rank': pos.rank,
          'Position': pos.position,
          'Grade': pos.grade,
          'Chest No': pos.entry.chestNo,
          'Candidate Name': pos.entry.members.map((m: any) => m.participant.name).join(', '),
          'Registration No': pos.entry.members.map((m: any) => m.participant.registrationNo).join(', '),
          'Institution Code': pos.entry.institution.code,
          'Institution Name': pos.entry.institution.name,
          'Final Score': pos.finalScore,
          'Points Awarded': pos.totalPoints,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Published_Results');
    XLSX.writeFile(wb, 'Sahodaya_Festival_Complete_Results.xlsx');
  };

  return (
    <>
      <AdminTopbar
        title="Reports & Export Hub"
        subtitle="Official certified printable result sheets, Excel and CSV master records"
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Quick Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Full Festival Master Excel</h3>
              <p className="text-xs text-slate-500 mt-1">
                Download consolidated spreadsheet of all completed programs, candidate scores, ranks and points.
              </p>
            </div>
            <button
              onClick={exportAllResultsXLSX}
              className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-emerald-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download Master (.xlsx)
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Championship Tally Report</h3>
              <p className="text-xs text-slate-500 mt-1">
                Export institution standings, gold/silver/bronze counts, and Grade A breakdown.
              </p>
            </div>
            <Link
              href="/admin/leaderboard"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              View & Export Standings
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Institution Directory</h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete roster of participating schools, student counts, and coordinator contacts.
              </p>
            </div>
            <Link
              href="/admin/institutions"
              className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Institutions
            </Link>
          </div>
        </div>

        {/* Printable Official Program Sheets */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Printer className="w-4 h-4 text-slate-600" />
              Official Certified Program Result Sheets (Printable / PDF)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {programs.length} Published Programs
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/60 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-28">Item Code</th>
                <th className="py-3 px-4 min-w-[200px]">Program Title</th>
                <th className="py-3 px-4">Category & Section</th>
                <th className="py-3 px-4">1st Position Winner</th>
                <th className="py-3 px-4 text-right">Printable Layout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Loading published sheets...</td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">No published results available yet.</td>
                </tr>
              ) : (
                programs.map((prog) => {
                  const firstWinner = prog.result?.positions.find((p: any) => p.position === '1st');
                  const winnerName = firstWinner?.entry.members.map((m: any) => m.participant.name).join(', ') || '-';
                  const winnerInst = firstWinner?.entry.institution.name || '';

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {prog.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {prog.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {prog.category?.name} • {prog.section}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{winnerName}</div>
                        <div className="text-[10px] text-slate-500">{winnerInst}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/results/${prog.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-semibold text-xs transition-all shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Official Sheet</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

