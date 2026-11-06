import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const festivals = await prisma.festival.findMany({
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: {
            institutions: true,
            programs: true,
            participants: true,
          },
        },
      },
    });
    return NextResponse.json({ festivals });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch festivals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(['SUPER_ADMIN']);
    const body = await request.json();

    const festival = await prisma.festival.create({
      data: {
        name: body.name,
        code: body.code.toUpperCase().trim(),
        year: parseInt(body.year),
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        venue: body.venue,
        description: body.description,
        status: body.status || 'UPCOMING',
        isPublished: body.isPublished ?? false,
      },
    });

    return NextResponse.json({ festival });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create festival' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth(['SUPER_ADMIN']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Festival ID is required' }, { status: 400 });
    }

    // Check festival exists
    const festival = await prisma.festival.findUnique({
      where: { id },
    });

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
    }

    // Delete associated audit logs first if any reference this festival
    await prisma.auditLog.deleteMany({
      where: { festivalId: id },
    });

    // Delete festival (cascades to institutions, programs, participants, etc.)
    await prisma.festival.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedName: festival.name });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete festival' },
      { status: 400 }
    );
  }
}

