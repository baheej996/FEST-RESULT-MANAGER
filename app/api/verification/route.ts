import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import {
  calculateProgramResults,
  recalculateFestivalLeaderboard,
  ScoreItem,
} from '@/lib/calculation-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'VERIFIER']);
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';

    const festival = await prisma.festival.findUnique({ where: { code: festivalCode } });
    if (!festival) {
      return NextResponse.json({ queue: [] });
    }

    const programs = await prisma.program.findMany({
      where: {
        festivalId: festival.id,
        status: { in: ['MARKS_ENTERED', 'UNDER_VERIFICATION', 'APPROVED', 'PUBLISHED'] },
      },
      include: {
        category: true,
        result: {
          include: {
            verifiedBy: { select: { name: true } },
            positions: {
              include: {
                entry: {
                  include: {
                    institution: true,
                    members: { include: { participant: true } },
                  },
                },
              },
              orderBy: { rank: 'asc' },
            },
          },
        },
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ queue: programs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'VERIFIER']);
    const body = await request.json();
    const { programId, action, notes } = body;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        entries: {
          include: {
            marks: true,
            institution: true,
            members: { include: { participant: true } },
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Prepare ScoreItems for calculation engine
    const scoreItems: ScoreItem[] = program.entries.map((entry) => ({
      entryId: entry.id,
      institutionId: entry.institutionId,
      chestNo: entry.chestNo,
      status: entry.status as any,
      marks: entry.marks.map((m) => m.mark),
    }));

    const positionPointsMap = JSON.parse(program.positionPoints || '{"1": 5, "2": 3, "3": 1}');
    const gradeBoundaries = JSON.parse(
      program.gradeBoundaries ||
        '[{"grade":"A","minPercentage":70,"points":5},{"grade":"B","minPercentage":60,"points":3},{"grade":"C","minPercentage":50,"points":1}]'
    );

    // Calculate outcomes
    const calculatedOutcomes = calculateProgramResults(
      scoreItems,
      program.maxMarks,
      program.scoringMethod,
      positionPointsMap,
      gradeBoundaries,
      program.tiePolicy as any
    );

    // ACTION: PREVIEW
    if (action === 'PREVIEW') {
      const previewData = calculatedOutcomes.map((item) => {
        const entry = program.entries.find((e) => e.id === item.entryId);
        return {
          ...item,
          chestNo: entry?.chestNo,
          institution: entry?.institution.name,
          participants: entry?.members.map((m) => m.participant.name).join(', '),
        };
      });
      return NextResponse.json({ preview: previewData });
    }

    // ACTION: APPROVE
    if (action === 'APPROVE') {
      await prisma.$transaction(async (tx) => {
        const result = await tx.result.upsert({
          where: { programId },
          update: {
            status: 'APPROVED',
            verifiedByUserId: user.userId,
            verifiedAt: new Date(),
            notes: notes || 'Verified and approved for publication.',
          },
          create: {
            programId,
            status: 'APPROVED',
            verifiedByUserId: user.userId,
            verifiedAt: new Date(),
            notes: notes || 'Verified and approved for publication.',
          },
        });

        // Write positions
        for (const out of calculatedOutcomes) {
          await tx.resultPosition.upsert({
            where: { entryId: out.entryId },
            update: {
              resultId: result.id,
              totalScore: out.totalScore,
              finalScore: out.finalScore,
              percentage: out.percentage,
              rank: out.rank,
              position: out.position,
              grade: out.grade,
              positionPoints: out.positionPoints,
              gradePoints: out.gradePoints,
              totalPoints: out.totalPoints,
              isTied: out.isTied,
              status: out.status,
            },
            create: {
              resultId: result.id,
              entryId: out.entryId,
              totalScore: out.totalScore,
              finalScore: out.finalScore,
              percentage: out.percentage,
              rank: out.rank,
              position: out.position,
              grade: out.grade,
              positionPoints: out.positionPoints,
              gradePoints: out.gradePoints,
              totalPoints: out.totalPoints,
              isTied: out.isTied,
              status: out.status,
            },
          });
        }

        await tx.program.update({
          where: { id: programId },
          data: { status: 'APPROVED' },
        });

        await tx.auditLog.create({
          data: {
            userId: user.userId,
            festivalId: program.festivalId,
            action: 'APPROVE_PROGRAM_RESULT',
            entityType: 'PROGRAM',
            entityId: programId,
            payload: JSON.stringify({ verifiedBy: user.name, notes }),
          },
        });
      });

      return NextResponse.json({ success: true, status: 'APPROVED' });
    }

    // ACTION: PUBLISH (Requires SUPER_ADMIN)
    if (action === 'PUBLISH') {
      if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Administrators can publish results to the public portal' },
          { status: 403 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.result.update({
          where: { programId },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });

        await tx.program.update({
          where: { id: programId },
          data: { status: 'PUBLISHED' },
        });

        await tx.auditLog.create({
          data: {
            userId: user.userId,
            festivalId: program.festivalId,
            action: 'PUBLISH_PROGRAM_RESULT',
            entityType: 'PROGRAM',
            entityId: programId,
            payload: JSON.stringify({ publishedBy: user.name }),
          },
        });
      });

      // Recalculate global institution championship points
      await recalculateFestivalLeaderboard(program.festivalId);

      return NextResponse.json({ success: true, status: 'PUBLISHED' });
    }

    // ACTION: REJECT
    if (action === 'REJECT') {
      await prisma.$transaction(async (tx) => {
        await tx.result.upsert({
          where: { programId },
          update: {
            status: 'DRAFT',
            notes: `Rejected by verifier: ${notes || 'Score discrepancies noted.'}`,
          },
          create: {
            programId,
            status: 'DRAFT',
            notes: `Rejected by verifier: ${notes || 'Score discrepancies noted.'}`,
          },
        });

        await tx.program.update({
          where: { id: programId },
          data: { status: 'READY_FOR_MARKS' },
        });

        await tx.auditLog.create({
          data: {
            userId: user.userId,
            festivalId: program.festivalId,
            action: 'REJECT_PROGRAM_RESULT',
            entityType: 'PROGRAM',
            entityId: programId,
            payload: JSON.stringify({ rejectedBy: user.name, reason: notes }),
          },
        });
      });

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    // ACTION: WITHDRAW (Unpublish)
    if (action === 'WITHDRAW') {
      if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Only Super Administrators can withdraw published results' },
          { status: 403 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.result.update({
          where: { programId },
          data: { status: 'APPROVED', publishedAt: null },
        });
        await tx.program.update({
          where: { id: programId },
          data: { status: 'APPROVED' },
        });
      });

      await recalculateFestivalLeaderboard(program.festivalId);

      return NextResponse.json({ success: true, status: 'WITHDRAWN' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}
