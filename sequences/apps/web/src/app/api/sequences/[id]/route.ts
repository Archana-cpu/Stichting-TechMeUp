/**
 * @deprecated This API route is deprecated in favor of server actions.
 * See: src/actions/sequences.ts
 * Keeping for backwards compatibility with external clients.
 */
import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const updateSequenceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(2000).optional(),
  eventDate: z.string().transform((s) => new Date(s)).optional(),
  image: z.string().url().optional().or(z.literal('')),
  emotionId: z.number().int().positive().optional(),
  emotionPolarity: z.number().int().min(-50).max(50).optional(),
  emotionIntensity: z.number().int().min(1).max(10).optional(),
  triggerId: z.number().int().positive().optional(),
  thoughtContent: z.string().min(1).max(2000).optional(),
  thoughtPolarity: z.number().int().min(-50).max(50).optional(),
  thoughtIntensity: z.number().int().min(1).max(10).optional(),
  behaviorContent: z.string().min(1).max(2000).optional(),
  behaviorPolarity: z.number().int().min(-50).max(50).optional(),
  behaviorImpact: z.number().int().min(1).max(10).optional(),
  isPublic: z.boolean().optional(),
  notes: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })).optional(),
  peopleIds: z.array(z.string()).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
  const sequence = await db.sequence.findUnique({
    where: { id },
    include: {
      emotion: true,
      trigger: true,
      notes: true,
      people: { include: { person: true } },
      user: { select: { id: true, username: true, name: true, image: true } },
    },
  });

  if (!sequence) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(sequence);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.sequence.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const result = updateSequenceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { notes, peopleIds, ...data } = result.data;

  await db.$transaction(async (tx) => {
    await tx.sequence.update({
      where: { id },
      data,
    });

    if (notes) {
      await tx.note.deleteMany({ where: { sequenceId: id } });
      
      for (const note of notes) {
        await tx.note.create({
          data: {
            sequenceId: id,
            content: note.content,
          },
        });
      }
    }

    if (peopleIds) {
      await tx.sequencePerson.deleteMany({ where: { sequenceId: id } });
      
      for (const personId of peopleIds) {
        await tx.sequencePerson.create({
          data: {
            sequenceId: id,
            personId,
          },
        });
      }
    }
  });

  const updated = await db.sequence.findUnique({
    where: { id },
    include: {
      emotion: true,
      trigger: true,
      notes: true,
      people: { include: { person: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.sequence.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.sequence.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
