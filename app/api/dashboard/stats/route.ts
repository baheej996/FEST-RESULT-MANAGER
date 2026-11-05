import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';

    const festival = await prisma.festival.findUnique({
      where: { code: festivalCode },
    });

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
    }

    const festivalId = festival.id;

    // Parallel counts
    const [
      totalParticipants,
      totalInstitutions,
      totalPrograms,
      completedPrograms,
      pendingMarkEntries,
      awaitingVerification,
      publishedResults,
      leaderboard,
      recentPublications,
      categoryStats,
    ] = await Promise.all([
      prisma.participant.count({ where: { festivalId } }),
      prisma.institution.count({ where: { festivalId } }),
      prisma.program.count({ where: { festivalId } }),
      prisma.program.count({ where: { festivalId, status: 'PUBLISHED' } }),
      prisma.program.count({
        where: {
          festivalId,
          status: { in: ['SCHEDULED', 'READY_FOR_MARKS'] },
        },
      }),
      prisma.result.count({
        where: {
          program: { festivalId },
          status: { in: ['SUBMITTED', 'UNDER_VERIFICATION'] },
        },
      }),
      prisma.result.count({
        where: {
          program: { festivalId },
          status: 'PUBLISHED',
        },
      }),
      prisma.institutionPoint.findMany({
        where: { festivalId },
        include: { institution: true },
        orderBy: [{ totalPoints: 'desc' }, { firstCount: 'desc' }],
        take: 10,
      }),
      prisma.result.findMany({
        where: {
          program: { festivalId },
          status: 'PUBLISHED',
        },
        include: {
          program: {
            include: { category: true },
          },
          positions: {
            where: { position: '1st' },
            include: {
              entry: {
                include: {
                  institution: true,
                  members: { include: { participant: true } },
                },
              },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      }),
      prisma.programCategory.findMany({
        where: { festivalId },
        include: {
          _count: {
            select: { programs: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      festival,
      counts: {
        totalParticipants,
        totalInstitutions,
        totalPrograms,
        completedPrograms,
        pendingMarkEntries,
        awaitingVerification,
        publishedResults,
      },
      leaderboard: leaderboard.map((item) => ({
        institutionId: item.institutionId,
        name: item.institution.name,
        code: item.institution.code,
        district: item.institution.district,
        totalPoints: item.totalPoints,
        firstCount: item.firstCount,
        secondCount: item.secondCount,
        thirdCount: item.thirdCount,
        gradeACount: item.gradeACount,
        rank: item.rank,
      })),
      recentPublications: recentPublications.map((res) => ({
        id: res.id,
        programName: res.program.name,
        programCode: res.program.code,
        category: res.program.category.name,
        section: res.program.section,
        publishedAt: res.publishedAt,
        winner: res.positions[0]?.entry.members[0]?.participant.name || 'Group Entry',
        winnerInstitution: res.positions[0]?.entry.institution.name || '-',
      })),
      categoryStats: categoryStats.map((cat) => ({
        name: cat.name,
        code: cat.code,
        count: cat._count.programs,
      })),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
