import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';
    const programId = searchParams.get('programId');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const festival = await prisma.festival.findUnique({
      where: { code: festivalCode },
    });

    if (!festival) {
      return NextResponse.json({ results: [], programs: [] });
    }

    // If specific program requested
    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId, festivalId: festival.id, status: 'PUBLISHED' },
        include: {
          category: true,
          result: {
            include: {
              positions: {
                include: {
                  entry: {
                    include: {
                      institution: true,
                      members: {
                        include: { participant: true },
                      },
                    },
                  },
                },
                orderBy: { rank: 'asc' },
              },
            },
          },
        },
      });

      return NextResponse.json({ program });
    }

    // General search across published results
    const publishedPrograms = await prisma.program.findMany({
      where: {
        festivalId: festival.id,
        status: 'PUBLISHED',
        category: category ? { code: category } : undefined,
      },
      include: {
        category: true,
        result: {
          include: {
            positions: {
              include: {
                entry: {
                  include: {
                    institution: true,
                    members: {
                      include: { participant: true },
                    },
                  },
                },
              },
              orderBy: { rank: 'asc' },
            },
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    // If search term provided, filter entries
    let filtered = publishedPrograms;
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = publishedPrograms.map((prog) => {
        if (!prog.result) return prog;
        const matchingPositions = prog.result.positions.filter((pos) => {
          const matchChest = pos.entry.chestNo.toLowerCase().includes(q);
          const matchInst = pos.entry.institution.name.toLowerCase().includes(q);
          const matchInstCode = pos.entry.institution.code.toLowerCase().includes(q);
          const matchProg = prog.name.toLowerCase().includes(q) || prog.code.toLowerCase().includes(q);
          const matchMember = pos.entry.members.some(
            (m) =>
              m.participant.name.toLowerCase().includes(q) ||
              m.participant.registrationNo.toLowerCase().includes(q)
          );
          return matchChest || matchInst || matchInstCode || matchProg || matchMember;
        });

        return {
          ...prog,
          result: {
            ...prog.result,
            positions: matchingPositions,
          },
        };
      }).filter((prog) => prog.result && prog.result.positions.length > 0);
    }

    return NextResponse.json({
      festival,
      programs: filtered,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
