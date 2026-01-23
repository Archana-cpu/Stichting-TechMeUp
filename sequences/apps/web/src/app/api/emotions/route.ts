import { NextResponse } from 'next/server';
import { db } from '@seq/database';

export async function GET() {
  const emotions = await db.emotion.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(emotions);
}
