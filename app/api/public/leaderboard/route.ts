import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';

    const festival = await prisma.festival.findUnique({
      where: { code: festivalCode },
    });

    if (!festival) {
      return NextResponse.json({ leaderboard: [] });
    }

    const leaderboard = await prisma.institutionPoint.findMany({
      where: { festivalId: festival.id },
      include: {
        institution: true,
      },
      orderBy: [{ totalPoints: 'desc' }, { firstCount: 'desc' }, { secondCount: 'desc' }],
    });

    return NextResponse.json({
      festival,
      leaderboard: leaderboard.map((item, index) => ({
        rank: index + 1,
        institutionId: item.institutionId,
        name: item.institution.name,
        code: item.institution.code,
        district: item.institution.district,
        totalPoints: item.totalPoints,
        firstCount: item.firstCount,
        secondCount: item.secondCount,
        thirdCount: item.thirdCount,
        gradeACount: item.gradeACount,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
