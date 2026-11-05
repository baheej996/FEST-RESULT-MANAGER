'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PrintableReport from '@/components/printable-report';

export default function ProgramPublicResultPage() {
  const params = useParams();
  const programId = params.programId as string;

  const [program, setProgram] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId) return;

    fetch(`/api/public/results?programId=${programId}`)
      .then((res) => res.json())
      .then((data) => {
        setProgram(data.program);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [programId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Loading official result sheet...
      </div>
    );
  }

  if (!program || !program.result) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Result sheet not found or not yet published.
      </div>
    );
  }

  const rows = program.result.positions.map((pos: any) => ({
    rank: pos.rank,
    position: pos.position,
    grade: pos.grade,
    totalPoints: pos.totalPoints,
    finalScore: pos.finalScore,
    chestNo: pos.entry.chestNo,
    candidateName: pos.entry.members.map((m: any) => m.participant.name).join(', '),
    registrationNo: pos.entry.members.map((m: any) => m.participant.registrationNo).join(', '),
    institutionName: pos.entry.institution.name,
    institutionCode: pos.entry.institution.code,
  }));

  return (
    <div className="py-8 bg-slate-100/60 min-h-screen">
      <div className="max-w-4xl mx-auto shadow-sm rounded-2xl overflow-hidden">
        <PrintableReport
          festivalName="Sahodaya Kalotsav"
          year={2026}
          venue="Silver Hills Central School, Kozhikode"
          programCode={program.code}
          programName={program.name}
          category={program.category?.name || 'Arts'}
          section={program.section}
          publishedDate={program.result.publishedAt ? new Date(program.result.publishedAt).toLocaleDateString() : undefined}
          rows={rows}
        />
      </div>
    </div>
  );
}

