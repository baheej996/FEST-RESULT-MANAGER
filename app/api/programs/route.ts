import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const festival = await prisma.festival.findUnique({ where: { code: festivalCode } });
    if (!festival) {
      return NextResponse.json({ programs: [], categories: [] });
    }

    const [programs, categories] = await Promise.all([
      prisma.program.findMany({
        where: {
          festivalId: festival.id,
          categoryId: categoryId || undefined,
          status: status || undefined,
          OR: search
            ? [
                { name: { contains: search } },
                { code: { contains: search } },
                { section: { contains: search } },
              ]
            : undefined,
        },
        include: {
          category: true,
          _count: {
            select: {
              entries: true,
              judgeAssignments: true,
            },
          },
          result: true,
        },
        orderBy: { code: 'asc' },
      }),
      prisma.programCategory.findMany({
        where: { festivalId: festival.id },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return NextResponse.json({ programs, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(['SUPER_ADMIN', 'PROGRAM_ADMIN']);
    const body = await request.json();

    const festival = await prisma.festival.findUnique({ where: { code: body.festivalCode || 'SK2026' } });
    if (!festival) throw new Error('Festival not found');

    const program = await prisma.program.create({
      data: {
        festivalId: festival.id,
        categoryId: body.categoryId,
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        type: body.type || 'INDIVIDUAL',
        section: body.section || 'General',
        maxMarks: parseFloat(body.maxMarks) || 100,
        judgeCount: parseInt(body.judgeCount) || 3,
        scoringMethod: body.scoringMethod || 'AVERAGE',
        status: 'SCHEDULED',
        positionPoints: body.positionPoints || JSON.stringify({ "1": 5, "2": 3, "3": 1 }),
        gradeBoundaries: body.gradeBoundaries || JSON.stringify([
          { grade: 'A', minPercentage: 70, points: 5 },
          { grade: 'B', minPercentage: 60, points: 3 },
          { grade: 'C', minPercentage: 50, points: 1 }
        ]),
        tiePolicy: body.tiePolicy || 'SHARED',
      },
    });

    return NextResponse.json({ program });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create program' }, { status: 400 });
  }
}
