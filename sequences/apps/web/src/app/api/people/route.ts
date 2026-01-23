/**
 * @deprecated This API route is deprecated in favor of server actions.
 * See: src/actions/people.ts
 * Keeping for backwards compatibility with external clients.
 */
import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const createPersonSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.enum(['family', 'friend', 'colleague', 'acquaintance', 'partner', 'other']),
  notes: z.string().max(1000).optional(),
  image: z.string().url().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const people = await db.person.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { sequences: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(people);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = createPersonSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const person = await db.person.create({
    data: {
      ...result.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(person, { status: 201 });
}
