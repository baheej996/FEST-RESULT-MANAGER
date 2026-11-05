'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Printer,
  Sparkles,
} from 'lucide-react';

interface Entry {
  id: string;
  chestNo: string;
  groupName?: string;
  status: string;
  institution: {
    id: string;
    name: string;
    code: string;
  };
  members: Array<{
    participantId: string;
    name: string;
    registrationNo: string;
    category: string;
  }>;
  marks: Array<{
    judgeIndex: number;
    mark: number;
    isDraft: boolean;
  }>;
}

interface ProgramInfo {
  id: string;
  name: string;
  code: string;
  section: string;
  type: string;
  maxMarks: number;
  judgeCount: number;
  scoringMethod: string;
  status: string;
  category?: { name: string };
}

interface MarkEntryGridProps {
  program: ProgramInfo;
  initialEntries: Entry[];
}

export default function MarkEntryGrid({ program, initialEntries }: MarkEntryGridProps) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  // Grid matrix: [entryId]: { [judgeIndex]: scoreString }
  const [marksState, setMarksState] = useState<Record<string, Record<number, string>>>({});
  const [entryStatus, setEntryStatus] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED' | 'DIRTY' | 'SAVING'>('IDLE');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Initialize marks state from entries
  useEffect(() => {
    const initialMarks: Record<string, Record<number, string>> = {};
    const initialStatuses: Record<string, string> = {};

    initialEntries.forEach((entry) => {
      initialMarks[entry.id] = {};
      initialStatuses[entry.id] = entry.status;

      // Populate existing marks
      entry.marks.forEach((m) => {
        initialMarks[entry.id][m.judgeIndex] = m.mark !== undefined ? m.mark.toString() : '';
      });

      // Ensure all judge slots exist
      for (let j = 1; j <= program.judgeCount; j++) {
        if (initialMarks[entry.id][j] === undefined) {
          initialMarks[entry.id][j] = '';
        }
      }
    });

    setMarksState(initialMarks);
    setEntryStatus(initialStatuses);
  }, [initialEntries, program.judgeCount]);

  // Handle cell value change
  const handleScoreChange = (entryId: string, judgeIndex: number, value: string) => {
    // Only allow numbers and decimal point
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;

    const num = parseFloat(value);
    if (!isNaN(num) && num > program.maxMarks) {
      setMessage({
        type: 'error',
        text: `Score ${num} exceeds maximum allowable mark of ${program.maxMarks}`,
      });
      return;
    } else {
      if (message?.type === 'error') setMessage(null);
    }

    setMarksState((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [judgeIndex]: value,
      },
    }));

    // If entering a score, mark status as PERFORMED if it was REGISTERED
    if (entryStatus[entryId] === 'REGISTERED' && value !== '') {
      setEntryStatus((prev) => ({ ...prev, [entryId]: 'PERFORMED' }));
    }

    setSaveStatus('DIRTY');
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    judgeIdx: number
  ) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Move to same judge in next row
      const nextRow = rowIdx + 1;
      if (nextRow < entries.length) {
        const nextId = `${entries[nextRow].id}-${judgeIdx}`;
        inputRefs.current[nextId]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move to same judge in previous row
      const prevRow = rowIdx - 1;
      if (prevRow >= 0) {
        const prevId = `${entries[prevRow].id}-${judgeIdx}`;
        inputRefs.current[prevId]?.focus();
      }
    } else if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart === e.currentTarget.value.length || e.currentTarget.value === '')) {
      if (judgeIdx < program.judgeCount) {
        e.preventDefault();
        const nextCol = `${entries[rowIdx].id}-${judgeIdx + 1}`;
        inputRefs.current[nextCol]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
      if (judgeIdx > 1) {
        e.preventDefault();
        const prevCol = `${entries[rowIdx].id}-${judgeIdx - 1}`;
        inputRefs.current[prevCol]?.focus();
      }
    }
  };

  // Calculate row total & average
  const getRowStats = (entryId: string) => {
    const entryMarks = marksState[entryId] || {};
    const values: number[] = [];

    for (let j = 1; j <= program.judgeCount; j++) {
      const v = parseFloat(entryMarks[j]);
      if (!isNaN(v)) values.push(v);
    }

    if (values.length === 0) return { total: '-', average: '-', isComplete: false };

    const total = values.reduce((a, b) => a + b, 0);
    const average = total / values.length;
    const isComplete = values.length === program.judgeCount;

    return {
      total: total.toFixed(2),
      average: average.toFixed(2),
      isComplete,
    };
  };

  // Save marks to server
  const handleSave = async (isDraft: boolean) => {
    setIsSaving(true);
    setSaveStatus('SAVING');
    setMessage(null);

    try {
      const entriesMarks = entries.map((entry) => ({
        entryId: entry.id,
        status: entryStatus[entry.id],
        judgeMarks: marksState[entry.id] || {},
      }));

      const res = await fetch(`/api/mark-entry/${program.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entriesMarks,
          isDraft,
          notes: isDraft ? 'Draft saved' : 'Completed mark entry submitted for verification',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save marks');
      }

      setSaveStatus('SAVED');
      setMessage({
        type: 'success',
        text: isDraft
          ? 'Draft marks saved safely to database.'
          : 'Marks submitted successfully! Result is now under verification.',
      });

      // Update program status in UI if submitted
      if (!isDraft) {
        program.status = 'MARKS_ENTERED';
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
      setSaveStatus('DIRTY');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [marksState, entryStatus]);

  return (
    <div className="space-y-6">
      {/* Program Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                {program.code}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {program.category?.name || 'Competition'}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {program.section}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  program.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : program.status === 'APPROVED'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : program.status === 'MARKS_ENTERED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {program.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Marks</span>
                <span className="font-bold text-slate-800 text-sm">{program.maxMarks}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Judges</span>
                <span className="font-bold text-slate-800 text-sm">{program.judgeCount}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contestants</span>
                <span className="font-bold text-slate-800 text-sm">{entries.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Draft (Ctrl+S)</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Verification</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
              title="Print blank mark sheet"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status / Alert Bar */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold select-none">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28">Chest No</th>
                <th className="py-3 px-4 min-w-[200px]">Participant / Troop</th>
                <th className="py-3 px-4 min-w-[180px]">Institution</th>
                <th className="py-3 px-4 w-32">Status</th>
                {Array.from({ length: program.judgeCount }).map((_, i) => (
                  <th key={i} className="py-3 px-4 w-28 text-center bg-indigo-50/40 text-indigo-900 border-l border-slate-200/80">
                    Judge {i + 1}
                  </th>
                ))}
                <th className="py-3 px-4 w-24 text-center bg-slate-100/60 font-bold border-l border-slate-200">
                  Total
                </th>
                <th className="py-3 px-4 w-24 text-center bg-slate-100/60 font-bold">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {entries.map((entry, rowIdx) => {
                const stats = getRowStats(entry.id);
                const currentStatus = entryStatus[entry.id] || 'REGISTERED';
                const isAbsent = currentStatus === 'ABSENT';
                const isDisqualified = currentStatus === 'DISQUALIFIED';

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isAbsent
                        ? 'bg-rose-50/30 text-slate-400'
                        : isDisqualified
                        ? 'bg-amber-50/30 text-slate-400'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-sans text-slate-400 font-medium">
                      {rowIdx + 1}
                    </td>

                    {/* Chest No */}
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">
                        {entry.chestNo}
                      </span>
                    </td>

                    {/* Participant Details */}
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-900 text-sm">
                        {entry.groupName || entry.members.map((m) => m.name).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {entry.members.map((m) => m.registrationNo).join(', ')}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="py-3 px-4 font-sans">
                      <div className="text-slate-800 font-medium truncate max-w-[200px]" title={entry.institution.name}>
                        {entry.institution.name}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {entry.institution.code}
                      </span>
                    </td>

                    {/* Status Selector */}
                    <td className="py-3 px-3 font-sans">
                      <select
                        value={currentStatus}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEntryStatus((prev) => ({ ...prev, [entry.id]: val }));
                          setSaveStatus('DIRTY');
                        }}
                        className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                          currentStatus === 'PERFORMED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : currentStatus === 'ABSENT'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : currentStatus === 'DISQUALIFIED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="REGISTERED">Registered</option>
                        <option value="PERFORMED">Performed</option>
                        <option value="ABSENT">Absent</option>
                        <option value="DISQUALIFIED">Disqualified</option>
                        <option value="WITHHELD">Withheld</option>
                      </select>
                    </td>

                    {/* Judge Inputs */}
                    {Array.from({ length: program.judgeCount }).map((_, j) => {
                      const judgeIdx = j + 1;
                      const cellId = `${entry.id}-${judgeIdx}`;
                      const val = marksState[entry.id]?.[judgeIdx] || '';
                      const isDisabled = isAbsent || isDisqualified;

                      return (
                        <td
                          key={judgeIdx}
                          className="py-2 px-3 text-center border-l border-slate-100 bg-slate-50/20"
                        >
                          <input
                            ref={(el) => {
                              inputRefs.current[cellId] = el;
                            }}
                            type="text"
                            inputMode="decimal"
                            disabled={isDisabled}
                            value={isDisabled ? '-' : val}
                            placeholder="0.00"
                            onChange={(e) =>
                              handleScoreChange(entry.id, judgeIdx, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, rowIdx, judgeIdx)}
                            className={`w-20 text-center py-1.5 px-2 text-sm font-mono font-bold rounded border transition-all mark-input ${
                              val !== '' && parseFloat(val) > program.maxMarks
                                ? 'border-rose-500 bg-rose-50 text-rose-700'
                                : val !== ''
                                ? 'border-indigo-200 bg-white text-indigo-950 font-bold'
                                : 'border-slate-200 bg-white text-slate-700'
                            } ${isDisabled ? 'bg-slate-100/60 cursor-not-allowed opacity-50' : ''}`}
                          />
                        </td>
                      );
                    })}

                    {/* Calculated Total */}
                    <td className="py-3 px-4 text-center font-bold text-slate-900 border-l border-slate-200 bg-slate-50/30">
                      {isAbsent ? 'ABS' : isDisqualified ? 'DISQ' : stats.total}
                    </td>

                    {/* Calculated Average */}
                    <td className="py-3 px-4 text-center font-bold text-indigo-700 bg-slate-50/30">
                      {isAbsent ? '-' : isDisqualified ? '-' : stats.average}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-6">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Enter</kbd> / <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↓</kbd> Next participant
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Tab</kbd> Next judge
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Ctrl+S</kbd> Save draft
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === 'SAVING' && (
              <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Syncing with database...
              </span>
            )}
            {saveStatus === 'SAVED' && (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                All changes saved safely
              </span>
            )}
            {saveStatus === 'DIRTY' && (
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved modifications
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
