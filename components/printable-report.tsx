'use client';

import React from 'react';
import { Trophy, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ResultRow {
  rank: number;
  position: string;
  grade: string;
  totalPoints: number;
  finalScore: number;
  chestNo: string;
  candidateName: string;
  registrationNo: string;
  institutionName: string;
  institutionCode: string;
}

interface PrintableReportProps {
  festivalName: string;
  venue: string;
  year: number;
  programCode: string;
  programName: string;
  section: string;
  category: string;
  publishedDate?: string;
  rows: ResultRow[];
}

export default function PrintableReport({
  festivalName,
  venue,
  year,
  programCode,
  programName,
  section,
  category,
  publishedDate,
  rows,
}: PrintableReportProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      {/* Screen action bar */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <Link
          href="/admin/reports"
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Official Result Sheet
        </button>
      </div>

      {/* Printable Document Header */}
      <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
        <div className="inline-flex items-center justify-center gap-2 text-indigo-700 mb-1">
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
            CBSE Sahodaya School Complex
          </span>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
          {festivalName} — {year}
        </h1>
        <p className="text-xs font-medium text-slate-600 mt-1">
          Venue: {venue}
        </p>
        <div className="mt-4 py-1.5 px-4 bg-slate-100 rounded-md inline-block border border-slate-300">
          <span className="text-sm font-bold tracking-wide uppercase text-slate-800">
            OFFICIAL CONSOLIDATED RESULT SHEET
          </span>
        </div>
      </div>

      {/* Program Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 px-4 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6 font-medium">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Program Item</span>
          <span className="font-bold text-slate-900 text-sm">{programName}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Item Code</span>
          <span className="font-mono font-bold text-slate-900">{programCode}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Category & Section</span>
          <span className="text-slate-900">{category} • {section}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Date Published</span>
          <span className="text-slate-900 font-mono">{publishedDate || 'Official Release'}</span>
        </div>
      </div>

      {/* Result Table */}
      <table className="w-full text-left text-xs border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[10px]">
            <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">Rank</th>
            <th className="py-2.5 px-3 border-r border-slate-300 w-16 text-center">Position</th>
            <th className="py-2.5 px-3 border-r border-slate-300 w-14 text-center">Grade</th>
            <th className="py-2.5 px-3 border-r border-slate-300 w-20 text-center font-mono">Chest No</th>
            <th className="py-2.5 px-4 border-r border-slate-300">Candidate / Group Name</th>
            <th className="py-2.5 px-4 border-r border-slate-300">Institution Represented</th>
            <th className="py-2.5 px-3 border-r border-slate-300 w-16 text-center font-mono">Score</th>
            <th className="py-2.5 px-3 w-14 text-center font-mono">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row, idx) => (
            <tr key={idx} className={row.position !== 'None' ? 'bg-indigo-50/20 font-medium' : ''}>
              <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold text-slate-800">
                {row.rank <= 50 ? row.rank : '-'}
              </td>
              <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold text-indigo-700">
                {row.position !== 'None' ? row.position : '-'}
              </td>
              <td className="py-2.5 px-3 border-r border-slate-300 text-center font-bold">
                {row.grade !== 'None' ? row.grade : '-'}
              </td>
              <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono font-bold">
                {row.chestNo}
              </td>
              <td className="py-2.5 px-4 border-r border-slate-300">
                <div className="font-bold text-slate-900">{row.candidateName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{row.registrationNo}</div>
              </td>
              <td className="py-2.5 px-4 border-r border-slate-300">
                <div className="text-slate-800">{row.institutionName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{row.institutionCode}</div>
              </td>
              <td className="py-2.5 px-3 border-r border-slate-300 text-center font-mono font-bold text-slate-800">
                {row.finalScore > 0 ? row.finalScore.toFixed(2) : '-'}
              </td>
              <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-900">
                {row.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature blocks */}
      <div className="mt-16 pt-8 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs text-slate-700 font-medium">
        <div>
          <div className="border-b border-dashed border-slate-400 pb-8 mb-2"></div>
          <span className="font-bold block">Adjudicator / Judge</span>
          <span className="text-[10px] text-slate-400">Signature & Date</span>
        </div>
        <div>
          <div className="border-b border-dashed border-slate-400 pb-8 mb-2"></div>
          <span className="font-bold block">Scrutiny / Verification Officer</span>
          <span className="text-[10px] text-slate-400">Signature & Date</span>
        </div>
        <div>
          <div className="border-b border-dashed border-slate-400 pb-8 mb-2"></div>
          <span className="font-bold block">Festival Convener / General Secretary</span>
          <span className="text-[10px] text-slate-400">Official Stamp & Seal</span>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
        Generated automatically by FestResult OS • Tamper-evident verified electronic record
      </div>
    </div>
  );
}

