'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { X, Quote as QuoteIcon } from 'lucide-react';
import { Button, Card, CardContent } from '@seq/ui';

type Quote = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  category: string;
};

type QuoteSplashProps = {
  onDismiss?: () => void;
  emotionKey?: string;
};

export function QuoteSplash({ onDismiss, emotionKey }: QuoteSplashProps) {
  const locale = useLocale();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const params = new URLSearchParams({ locale, random: 'true' });
        if (emotionKey) {
          params.set('emotion', emotionKey);
        }
        const response = await fetch(`/api/quotes?${params}`);
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          setIsVisible(true);
        }
      } catch {
        console.error('Failed to fetch quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [locale, emotionKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  if (isLoading || !quote || !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Card className="relative mx-4 max-w-2xl border-primary/20 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-8 pt-12">
          <QuoteIcon className="mx-auto mb-6 h-12 w-12 text-primary/50" />

          <blockquote className="mb-6 text-center">
            <p className="text-xl font-medium leading-relaxed text-foreground/90 md:text-2xl">
              &ldquo;{quote.text}&rdquo;
            </p>
          </blockquote>

          <div className="text-center">
            <p className="font-semibold text-foreground">{quote.author}</p>
            {quote.source && (
              <p className="mt-1 text-sm text-muted-foreground">{quote.source}</p>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={handleDismiss} className="px-8">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
