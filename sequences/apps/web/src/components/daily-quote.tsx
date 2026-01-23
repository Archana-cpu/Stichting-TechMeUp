'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button } from '@seq/ui';

type Quote = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  category: string;
  dayOfYear: number;
};

export function DailyQuote() {
  const locale = useLocale();
  const t = useTranslations('common');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDailyQuote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes/daily?locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data);
      }
    } catch {
      console.error('Failed to fetch daily quote');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, [locale]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QuoteIcon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Quote of the Day
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchDailyQuote}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <blockquote className="mb-4">
          <p className="text-lg font-medium leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{quote.author}</p>
            {quote.source && (
              <p className="text-sm text-muted-foreground">{quote.source}</p>
            )}
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {quote.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
