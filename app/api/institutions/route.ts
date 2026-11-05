import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const festivalCode = searchParams.get('festivalCode') || 'SK2026';
    const search = searchParams.get('search') || '';

    const festival = await prisma.festival.findUnique({ where: { code: festivalCode } });
    if (!festival) {
      return NextResponse.json({ institutions: [] });
    }

    const institutions = await prisma.institution.findMany({
      where: {
        festivalId: festival.id,
        OR: search
          ? [
              { name: { contains: search } },
              { code: { contains: search } },
              { district: { contains: search } },
            ]
          : undefined,
      },
      include: {
        _count: {
          select: {
            participants: true,
            entries: true,
          },
        },
        pointsSummary: true,
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ institutions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['SUPER_ADMIN']);
    const body = await request.json();

    // Check if bulk import or single
    if (Array.isArray(body.items)) {
      const festival = await prisma.festival.findUnique({ where: { code: body.festivalCode || 'SK2026' } });
      if (!festival) throw new Error('Festival not found');

      const createdItems = [];
      for (const item of body.items) {
        if (!item.name || !item.code) continue;
        const inst = await prisma.institution.upsert({
          where: { festivalId_code: { festivalId: festival.id, code: item.code.trim() } },
          update: {
            name: item.name.trim(),
            district: item.district?.trim() || null,
            category: item.category?.trim() || null,
            contactPerson: item.contactPerson?.trim() || null,
            contactPhone: item.contactPhone?.trim() || null,
          },
          create: {
            festivalId: festival.id,
            code: item.code.trim(),
            name: item.name.trim(),
            district: item.district?.trim() || null,
            category: item.category?.trim() || null,
            contactPerson: item.contactPerson?.trim() || null,
            contactPhone: item.contactPhone?.trim() || null,
          },
        });
        createdItems.push(inst);
      }
      return NextResponse.json({ count: createdItems.length, success: true });
    }

    // Single creation
    const festival = await prisma.festival.findUnique({ where: { code: body.festivalCode || 'SK2026' } });
    if (!festival) throw new Error('Festival not found');

    const institution = await prisma.institution.create({
      data: {
        festivalId: festival.id,
        code: body.code.trim().toUpperCase(),
        name: body.name.trim(),
        district: body.district?.trim() || null,
        category: body.category?.trim() || null,
        contactPerson: body.contactPerson?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
      },
    });

    return NextResponse.json({ institution });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}
