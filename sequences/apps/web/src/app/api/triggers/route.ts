import { NextResponse } from 'next/server';
import { db } from '@seq/database';

export async function GET() {
  const triggers = await db.trigger.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(triggers);
}
