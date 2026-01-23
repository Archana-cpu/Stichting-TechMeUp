/**
 * @deprecated This API route is deprecated in favor of server actions.
 * See: src/actions/sequences.ts
 * Keeping for backwards compatibility with external clients.
 */
import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const createSequenceSchema = z.object({
  eventDate: z.string().transform((s) => new Date(s)),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  image: z.string().url().optional(),
  isPublic: z.boolean().default(false),
  emotionId: z.number().int().positive(),
  emotionPolarity: z.number().int().min(-50).max(50),
  emotionIntensity: z.number().int().min(1).max(10),
  triggerId: z.number().int().positive(),
  thoughtContent: z.string().min(1).max(2000),
  thoughtPolarity: z.number().int().min(-50).max(50),
  thoughtIntensity: z.number().int().min(1).max(10),
  behaviorContent: z.string().min(1).max(2000),
  behaviorPolarity: z.number().int().min(-50).max(50),
  behaviorImpact: z.number().int().min(1).max(10),
  peopleIds: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sequences = await db.sequence.findMany({
    where: { userId: session.user.id },
    include: {
      emotion: true,
      trigger: true,
      people: { include: { person: true } },
      _count: { select: { reactions: true, comments: true } },
    },
    orderBy: { storyboardOrder: 'asc' },
  });

  return NextResponse.json(sequences);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = createSequenceSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const data = result.data;
  const { peopleIds, ...sequenceData } = data;

  const maxOrder = await db.sequence.aggregate({
    where: { userId: session.user.id },
    _max: { storyboardOrder: true },
  });

  const sequence = await db.sequence.create({
    data: {
      ...sequenceData,
      userId: session.user.id,
      storyboardOrder: (maxOrder._max.storyboardOrder || 0) + 1,
      people: peopleIds?.length
        ? {
            create: peopleIds.map((personId) => ({ personId })),
          }
        : undefined,
    },
    include: {
      emotion: true,
      trigger: true,
      people: { include: { person: true } },
    },
  });

  return NextResponse.json(sequence, { status: 201 });
}
