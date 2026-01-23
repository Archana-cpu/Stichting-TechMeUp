import { NextResponse, type NextRequest } from 'next/server';
import { prisma, type Quote } from '@seq/database';

type TextKey = 'textEn' | 'textTr' | 'textNl';

function getLocalizedText(quote: Quote, locale: string): string {
  const textKey = `text${locale.charAt(0).toUpperCase() + locale.slice(1)}` as TextKey;
  return quote[textKey] || quote.textEn;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emotionKey = searchParams.get('emotion');
  const locale = searchParams.get('locale') || 'en';
  const random = searchParams.get('random') === 'true';

  const where = {
    isActive: true,
    ...(emotionKey && { emotionKeys: { has: emotionKey } }),
  };

  if (random) {
    const count = await prisma.quote.count({ where });
    const skip = Math.floor(Math.random() * count);
    const quote = await prisma.quote.findFirst({
      where,
      skip,
    });

    if (!quote) {
      return NextResponse.json({ error: 'No quote found' }, { status: 404 });
    }

    return NextResponse.json({
      id: quote.id,
      text: getLocalizedText(quote, locale),
      author: quote.author,
      source: quote.source,
      category: quote.category,
    });
  }

  const quotes = await prisma.quote.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    quotes.map((quote) => ({
      id: quote.id,
      text: getLocalizedText(quote, locale),
      author: quote.author,
      source: quote.source,
      category: quote.category,
    }))
  );
}
