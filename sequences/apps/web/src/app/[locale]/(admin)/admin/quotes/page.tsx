import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { QuotesManager } from '@/components/admin/quotes-manager';
import { createQuote, updateQuote, deleteQuote } from '@/app/actions';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function AdminQuotesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const quotes = await db.quote.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <QuotesManager
      quotes={quotes}
      onCreateQuote={createQuote as Parameters<typeof QuotesManager>[0]['onCreateQuote']}
      onUpdateQuote={updateQuote as Parameters<typeof QuotesManager>[0]['onUpdateQuote']}
      onDeleteQuote={deleteQuote as Parameters<typeof QuotesManager>[0]['onDeleteQuote']}
    />
  );
}
