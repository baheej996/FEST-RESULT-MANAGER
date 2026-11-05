'use client';

import React, { useEffect, useState } from 'react';
import AdminTopbar from '@/components/admin-topbar';
import {
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  RotateCcw,
  AlertCircle,
  Check,
  ShieldCheck,
  Award,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function VerificationPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    fetch('/api/verification')
      .then((res) => res.json())
      .then((data) => {
        setQueue(data.queue || []);
        if (data.queue && data.queue.length > 0 && !selectedProgram) {
          selectProgram(data.queue[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectProgram = async (prog: any) => {
    setSelectedProgram(prog);
    setMessage(null);
    setNotes(prog.result?.notes || '');

    // Fetch calculation preview
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: prog.id, action: 'PREVIEW' }),
      });
      const json = await res.json();
      setPreviewData(json.preview || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (action: 'APPROVE' | 'PUBLISH' | 'REJECT' | 'WITHDRAW') => {
    if (!selectedProgram) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          action,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMessage({
        type: 'success',
        text:
          action === 'APPROVE'
            ? 'Result successfully approved! It is now ready for public release.'
            : action === 'PUBLISH'
            ? 'Result successfully published to the public portal and championship leaderboard updated!'
            : action === 'REJECT'
            ? 'Result rejected and returned to mark entry operator with notes.'
            : 'Result withdrawn and unpublished from public portal.',
      });

      // Refetch queue and update selected program
      fetchQueue();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <AdminTopbar
        title="Result Verification & Publication"
        subtitle="Multi-tier scrutiny, calculation validation, and public publishing"
      />

      <main className="p-8 space-y-6 flex-1">
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="font-bold">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Verification Queue (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Programs for Scrutiny ({queue.length})
              </span>
              <button
                onClick={fetchQueue}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Refresh
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
              ) : queue.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No programs currently awaiting verification.
                </div>
              ) : (
                queue.map((prog) => {
                  const isSelected = selectedProgram?.id === prog.id;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => selectProgram(prog)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                          {prog.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prog.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : prog.status === 'APPROVED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {prog.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{prog.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {prog.category?.name} • {prog.section}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Scrutiny & Approval Pane (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedProgram ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                {/* Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {selectedProgram.code}
                      </span>
                      <span className="text-xs text-slate-500">{selectedProgram.section}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedProgram.name}</h2>
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProgram.status !== 'APPROVED' &&
                      selectedProgram.status !== 'PUBLISHED' && (
                        <button
                          onClick={() => handleAction('APPROVE')}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Result</span>
                        </button>
                      )}

                    {selectedProgram.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handleAction('PUBLISH')}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish to Portal</span>
                      </button>
                    )}

                    {selectedProgram.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleAction('WITHDRAW')}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-bold border border-slate-200 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Withdraw Result</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleAction('REJECT')}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Return for Correction</span>
                    </button>
                  </div>
                </div>

                {/* Scrutiny Computed Positions Table */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Mathematical Evaluation & Position Preview
                  </h3>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <th className="py-2.5 px-3 text-center">Rank</th>
                          <th className="py-2.5 px-3 text-center">Position</th>
                          <th className="py-2.5 px-3 text-center">Grade</th>
                          <th className="py-2.5 px-3">Chest No</th>
                          <th className="py-2.5 px-4">Candidate</th>
                          <th className="py-2.5 px-4">Institution</th>
                          <th className="py-2.5 px-3 text-center">Final Score</th>
                          <th className="py-2.5 px-3 text-center">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewData && previewData.length > 0 ? (
                          previewData.map((row: any, i: number) => (
                            <tr
                              key={i}
                              className={
                                row.position !== 'None'
                                  ? 'bg-indigo-50/30 font-semibold'
                                  : 'hover:bg-slate-50'
                              }
                            >
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                                {row.rank <= 100 ? row.rank : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    row.position === '1st'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : row.position === '2nd'
                                      ? 'bg-slate-200 text-slate-800'
                                      : row.position === '3rd'
                                      ? 'bg-orange-100 text-orange-900'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {row.position !== 'None' ? row.position : '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold font-mono">
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    row.grade === 'A'
                                      ? 'text-emerald-700 bg-emerald-50'
                                      : row.grade === 'B'
                                      ? 'text-blue-700 bg-blue-50'
                                      : row.grade === 'C'
                                      ? 'text-amber-700 bg-amber-50'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {row.grade !== 'None' ? row.grade : '-'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {row.chestNo}
                              </td>
                              <td className="py-2.5 px-4 font-bold text-slate-800">
                                {row.participants}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">
                                {row.institution}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                                {row.finalScore > 0 ? row.finalScore.toFixed(2) : '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">
                                {row.totalPoints}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              No marks available to calculate.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Scrutiny Notes Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Scrutiny Officer Remarks / Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter verification comments, signed physical sheet confirmation, or rejection reason..."
                    className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-sans"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
                Select a program from the left queue to scrutinize marks and approve results.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

