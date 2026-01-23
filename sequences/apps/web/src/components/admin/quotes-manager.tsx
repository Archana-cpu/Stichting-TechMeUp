'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  cn,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Switch,
} from '@seq/ui';
import { Plus, Edit2, Trash2, Quote, Search, Filter } from 'lucide-react';
import type { Quote as QuoteType } from '@seq/database';

import { DataTable } from '../data-display';
import { ConfirmDialog } from '../primitives';

type QuoteFormData = {
  textEn: string;
  textTr: string;
  textNl: string;
  author: string;
  source?: string;
  category: 'psychology' | 'philosophy' | 'sociology';
  isActive: boolean;
  emotionKeys: string[];
};

type QuotesManagerProps = {
  quotes: QuoteType[];
  onCreateQuote: (quote: Partial<QuoteFormData>) => Promise<unknown>;
  onUpdateQuote: (id: string, quote: Partial<QuoteFormData>) => Promise<unknown>;
  onDeleteQuote: (id: string) => Promise<unknown>;
};

const CATEGORIES = ['psychology', 'philosophy', 'sociology'] as const;

export function QuotesManager({
  quotes,
  onCreateQuote,
  onUpdateQuote,
  onDeleteQuote,
}: QuotesManagerProps) {
  const t = useTranslations('quotes');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<QuoteFormData>({
    textEn: '',
    textTr: '',
    textNl: '',
    author: '',
    source: '',
    category: 'psychology',
    isActive: true,
    emotionKeys: [],
  });

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      !searchQuery.trim() ||
      quote.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || quote.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (quote?: QuoteType) => {
    if (quote) {
      setEditingQuote(quote);
      setFormData({
        textEn: quote.textEn,
        textTr: quote.textTr,
        textNl: quote.textNl,
        author: quote.author,
        source: quote.source || '',
        category: quote.category as 'psychology' | 'philosophy' | 'sociology',
        isActive: quote.isActive,
        emotionKeys: quote.emotionKeys,
      });
    } else {
      setEditingQuote(null);
      setFormData({
        textEn: '',
        textTr: '',
        textNl: '',
        author: '',
        source: '',
        category: 'psychology',
        isActive: true,
        emotionKeys: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (editingQuote) {
        await onUpdateQuote(editingQuote.id, formData);
      } else {
        await onCreateQuote(formData);
      }
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'quote',
      header: 'Quote',
      accessor: (quote: QuoteType) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-2">"{quote.textEn}"</p>
          <p className="text-xs text-muted-foreground mt-1">— {quote.author}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('category'),
      accessor: (quote: QuoteType) => (
        <Badge variant="secondary">{t(`categories.${quote.category}` as any)}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (quote: QuoteType) => (
        <Badge variant={quote.isActive ? 'success' : 'secondary'}>
          {quote.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      accessor: (quote: QuoteType) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quote)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete Quote"
            description="Are you sure you want to delete this quote? This action cannot be undone."
            variant="destructive"
            onConfirm={() => onDeleteQuote(quote.id)}
          />
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            Manage wisdom quotes displayed to users
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Quote
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t(`categories.${cat}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredQuotes}
        keyExtractor={(quote) => quote.id}
        emptyMessage="No quotes found"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5" />
              {editingQuote ? 'Edit Quote' : 'New Quote'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>English Text *</Label>
              <Textarea
                value={formData.textEn}
                onChange={(e) => setFormData({ ...formData, textEn: e.target.value })}
                placeholder="Enter the quote in English"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Turkish Text *</Label>
              <Textarea
                value={formData.textTr}
                onChange={(e) => setFormData({ ...formData, textTr: e.target.value })}
                placeholder="Enter the quote in Turkish"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Dutch Text *</Label>
              <Textarea
                value={formData.textNl}
                onChange={(e) => setFormData({ ...formData, textNl: e.target.value })}
                placeholder="Enter the quote in Dutch"
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Author *</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('source')}</Label>
                <Input
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Book, speech, etc."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as 'psychology' | 'philosophy' | 'sociology' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`categories.${cat}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label>Active</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.textEn || !formData.textTr || !formData.textNl || !formData.author || isLoading}
            >
              {isLoading ? tCommon('loading') : editingQuote ? tCommon('save') : tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
