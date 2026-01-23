/**
 * @deprecated This API route is deprecated in favor of server actions.
 * See: src/actions/people.ts
 * Keeping for backwards compatibility with external clients.
 */
import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const updatePersonSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  relationship: z.enum(['family', 'friend', 'colleague', 'acquaintance', 'partner', 'other']).optional(),
  notes: z.string().max(1000).optional(),
  image: z.string().url().optional(),
});

// Schema for position updates (PATCH)
const updatePositionSchema = z.object({
  positionX: z.number(),
  positionY: z.number(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const person = await db.person.findUnique({
    where: { id, userId: session.user.id },
    include: {
      sequences: {
        include: {
          sequence: {
            select: { id: true, title: true, eventDate: true, image: true },
          },
        },
      },
    },
  });

  if (!person) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(person);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.person.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = updatePersonSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const person = await db.person.update({
    where: { id },
    data: result.data,
  });

  return NextResponse.json(person);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.person.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = updatePositionSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const person = await db.person.update({
    where: { id },
    data: {
      positionX: result.data.positionX,
      positionY: result.data.positionY,
    },
  });

  return NextResponse.json(person);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.person.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await db.person.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
