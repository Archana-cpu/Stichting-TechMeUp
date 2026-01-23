import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const reorderSchema = z.object({
  sequences: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = reorderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { sequences } = result.data;

  await db.$transaction(
    sequences.map(({ id, order }) =>
      db.sequence.updateMany({
        where: { id, userId: session.user.id },
        data: { storyboardOrder: order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
