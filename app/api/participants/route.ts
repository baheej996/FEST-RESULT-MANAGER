import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';
    const institutionId = searchParams.get('institutionId') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const festival = await prisma.festival.findUnique({ where: { code: festivalCode } });
    if (!festival) {
      return NextResponse.json({ participants: [] });
    }

    const participants = await prisma.participant.findMany({
      where: {
        festivalId: festival.id,
        institutionId: institutionId || undefined,
        category: category || undefined,
        OR: search
          ? [
              { name: { contains: search } },
              { registrationNo: { contains: search } },
            ]
          : undefined,
      },
      include: {
        institution: true,
        entryMembers: {
          include: {
            entry: {
              include: {
                program: true,
                resultPosition: true,
              },
            },
          },
        },
      },
      orderBy: { registrationNo: 'asc' },
    });

    return NextResponse.json({ participants });
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

    // Bulk Import
    if (Array.isArray(body.items)) {
      let createdCount = 0;
      for (const item of body.items) {
        if (!item.registrationNo || !item.name || !item.institutionCode) continue;

        const inst = await prisma.institution.findUnique({
          where: { festivalId_code: { festivalId: festival.id, code: item.institutionCode.trim() } },
        });
        if (!inst) continue;

        await prisma.participant.upsert({
          where: { festivalId_registrationNo: { festivalId: festival.id, registrationNo: item.registrationNo.trim() } },
          update: {
            name: item.name.trim(),
            institutionId: inst.id,
            category: item.category?.trim() || 'General',
            gradeClass: item.gradeClass?.trim() || null,
            gender: item.gender?.trim() || null,
          },
          create: {
            festivalId: festival.id,
            institutionId: inst.id,
            registrationNo: item.registrationNo.trim(),
            name: item.name.trim(),
            category: item.category?.trim() || 'General',
            gradeClass: item.gradeClass?.trim() || null,
            gender: item.gender?.trim() || null,
          },
        });
        createdCount++;
      }
      return NextResponse.json({ count: createdCount, success: true });
    }

    // Single Participant
    const inst = await prisma.institution.findUnique({
      where: { id: body.institutionId },
    });
    if (!inst) throw new Error('Institution not found');

    const participant = await prisma.participant.create({
      data: {
        festivalId: festival.id,
        institutionId: inst.id,
        registrationNo: body.registrationNo.trim().toUpperCase(),
        name: body.name.trim(),
        category: body.category || 'General',
        gradeClass: body.gradeClass || null,
        gender: body.gender || null,
      },
    });

    return NextResponse.json({ participant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}
