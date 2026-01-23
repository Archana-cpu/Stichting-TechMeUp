'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { cn, Button, ScrollArea, Sheet, SheetContent, SheetTrigger } from '@seq/ui';
import {
  LayoutDashboard,
  Users,
  Settings,
  Quote,
  FileText,
  ClipboardList,
  BarChart,
  Menu,
  ChevronLeft,
  Sparkles,
  Palette,
} from 'lucide-react';

type AdminLayoutProps = {
  children: React.ReactNode;
};

const adminNavItems = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'users', href: '/admin/users', icon: Users },
  { key: 'quotes', href: '/admin/quotes', icon: Quote },
  { key: 'branding', href: '/admin/branding', icon: Palette },
  { key: 'contentBlocks', href: '/admin/content', icon: FileText },
  { key: 'analytics', href: '/admin/analytics', icon: BarChart },
  { key: 'auditLog', href: '/admin/audit', icon: ClipboardList },
  { key: 'systemSettings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const t = useTranslations('admin');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`;
    if (href === '/admin') {
      return pathname === fullHref;
    }
    return pathname.startsWith(fullHref);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold">{t('title')}</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {t(item.key as any)}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/${locale}/dashboard`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to App
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card">
        <NavContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur lg:hidden">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>

          <span className="font-semibold">{t('title')}</span>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
