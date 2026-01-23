import { NextResponse, type NextRequest } from 'next/server';
import { prisma, type Quote } from '@seq/database';

type TextKey = 'textEn' | 'textTr' | 'textNl';

function getLocalizedText(quote: Quote, locale: string): string {
  const textKey = `text${locale.charAt(0).toUpperCase() + locale.slice(1)}` as TextKey;
  return quote[textKey] || quote.textEn;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const quotes = await prisma.quote.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  });

  if (quotes.length === 0) {
    return NextResponse.json({ error: 'No quotes available' }, { status: 404 });
  }

  const quoteIndex = dayOfYear % quotes.length;
  const quote = quotes[quoteIndex];

  if (!quote) {
    return NextResponse.json({ error: 'No quotes available' }, { status: 404 });
  }

  return NextResponse.json({
    id: quote.id,
    text: getLocalizedText(quote, locale),
    author: quote.author,
    source: quote.source,
    category: quote.category,
    dayOfYear,
  });
}
