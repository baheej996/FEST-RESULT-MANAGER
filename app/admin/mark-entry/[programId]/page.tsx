'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminTopbar from '@/components/admin-topbar';
import MarkEntryGrid from '@/components/mark-entry-grid';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProgramMarkEntryPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [data, setData] = useState<{ program: any; entries: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!programId) return;

    fetch(`/api/mark-entry/${programId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load program mark sheet');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [programId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading keyboard mark sheet...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {error || 'Program not found'}
        </div>
        <Link
          href="/admin/mark-entry"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mark Entry List
        </Link>
      </div>
    );
  }

  return (
    <>
      <AdminTopbar
        title={`Mark Entry: ${data.program.name}`}
        subtitle={`${data.program.code} • ${data.program.section}`}
      />

      <main className="p-8 space-y-6 flex-1">
        <div className="mb-2">
          <Link
            href="/admin/mark-entry"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Programs
          </Link>
        </div>

        <MarkEntryGrid program={data.program} initialEntries={data.entries} />
      </main>
    </>
  );
}

