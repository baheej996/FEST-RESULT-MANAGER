import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { calculateProgramResults } from '@/lib/calculation-engine';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    await requireAuth(['SUPER_ADMIN', 'PROGRAM_ADMIN', 'JUDGE', 'VERIFIER']);
    const { programId } = params;

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        category: true,
        judgeAssignments: {
          include: { judge: true },
          orderBy: { judgeIndex: 'asc' },
        },
        result: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const entries = await prisma.competitionEntry.findMany({
      where: { programId },
      include: {
        institution: true,
        members: {
          include: { participant: true },
        },
        marks: {
          orderBy: { judgeIndex: 'asc' },
        },
      },
      orderBy: { chestNo: 'asc' },
    });

    return NextResponse.json({
      program,
      entries: entries.map((entry) => ({
        id: entry.id,
        chestNo: entry.chestNo,
        groupName: entry.groupName,
        status: entry.status,
        institution: {
          id: entry.institution.id,
          name: entry.institution.name,
          code: entry.institution.code,
        },
        members: entry.members.map((m) => ({
          participantId: m.participant.id,
          name: m.participant.name,
          registrationNo: m.participant.registrationNo,
          category: m.participant.category,
          isLeader: m.isLeader,
        })),
        marks: entry.marks.map((mk) => ({
          judgeIndex: mk.judgeIndex,
          mark: mk.mark,
          isDraft: mk.isDraft,
          remarks: mk.remarks,
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { programId: string } }
) {
  try {
    const user = await requireAuth(['SUPER_ADMIN', 'PROGRAM_ADMIN', 'JUDGE']);
    const { programId } = params;
    const body = await request.json();
    const { entriesMarks, isDraft, notes } = body;

    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Prohibit editing if already published unless super admin
    if (program.status === 'PUBLISHED' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify marks for already published results' },
        { status: 403 }
      );
    }

    const maxMarks = program.maxMarks;

    // Validate and save marks transactionally
    await prisma.$transaction(async (tx) => {
      for (const item of entriesMarks) {
        const { entryId, status, judgeMarks } = item;

        // Update entry status if changed
        if (status) {
          await tx.competitionEntry.update({
            where: { id: entryId },
            data: { status },
          });
        }

        // Upsert marks per judge
        if (judgeMarks && typeof judgeMarks === 'object') {
          for (const [judgeIdxStr, scoreVal] of Object.entries(judgeMarks)) {
            const judgeIndex = parseInt(judgeIdxStr);
            const markNumber = parseFloat(scoreVal as string);

            if (isNaN(markNumber)) continue;

            if (markNumber < 0 || markNumber > maxMarks) {
              throw new Error(
                `Score ${markNumber} exceeds maximum allowable mark of ${maxMarks}`
              );
            }

            await tx.mark.upsert({
              where: {
                entryId_judgeIndex: {
                  entryId,
                  judgeIndex,
                },
              },
              update: {
                mark: markNumber,
                isDraft: !!isDraft,
                enteredByUserId: user.userId,
              },
              create: {
                entryId,
                judgeIndex,
                mark: markNumber,
                isDraft: !!isDraft,
                enteredByUserId: user.userId,
              },
            });
          }
        }
      }

      // If submitting (not draft), auto-calculate draft results and transition program status
      if (!isDraft) {
        // Update program status to MARKS_ENTERED
        await tx.program.update({
          where: { id: programId },
          data: { status: 'MARKS_ENTERED' },
        });

        // Initialize or update Result record as SUBMITTED
        await tx.result.upsert({
          where: { programId },
          update: {
            status: 'SUBMITTED',
            notes: notes || 'Marks submitted by operator, pending verification.',
          },
          create: {
            programId,
            status: 'SUBMITTED',
            notes: notes || 'Marks submitted by operator, pending verification.',
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          festivalId: program.festivalId,
          action: isDraft ? 'SAVE_MARK_DRAFT' : 'SUBMIT_MARKS_FOR_VERIFICATION',
          entityType: 'PROGRAM',
          entityId: programId,
          payload: JSON.stringify({ entriesUpdated: entriesMarks.length, isDraft }),
        },
      });
    });

    return NextResponse.json({ success: true, isDraft: !!isDraft });
  } catch (error: any) {
    console.error('Mark save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save marks' },
      { status: 400 }
    );
  }
}
