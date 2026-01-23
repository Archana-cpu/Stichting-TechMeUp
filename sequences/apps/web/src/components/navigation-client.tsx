'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@seq/ui';
import { Settings, Plus, User, BookOpen, Users, MessageCircle, Menu, X, ChevronLeft, Bell } from 'lucide-react';
import { UserMenu } from './user-menu';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { BrandLogo } from './brand-logo';
import type { Session } from 'next-auth';

type NavigationClientProps = {
  session: Session | null;
};

export function NavigationClient({ session }: NavigationClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update CSS variable for sidebar width
  useEffect(() => {
    if (session?.user && !isMobile) {
      document.documentElement.style.setProperty('--sidebar-width', sidebarOpen ? '256px' : '64px');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '0px');
    }
  }, [sidebarOpen, isMobile, session]);

  const navItems = [
    { href: '/storyboard', icon: BookOpen, label: 'Hikayem' },
    { href: '/lifetree', icon: Users, label: 'Yaşam Ağacı' },
    { href: '/messages', icon: MessageCircle, label: 'Mesajlar' },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <>
      {/* Sidebar - Full Height, Logo on Top */}
      {session?.user && !isMobile && (
        <aside
          className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 transition-all duration-200 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo Section - Top */}
            <div className="flex items-center justify-between p-4 border-b border-border h-16 shrink-0">
              {sidebarOpen ? (
                <BrandLogo variant="full" className="h-6 shrink-0 transition-opacity hover:opacity-80" />
              ) : (
                <BrandLogo variant="icon" className="h-8 w-8 shrink-0 transition-opacity hover:opacity-80" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-auto"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
              </Button>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}

              <Link
                href="/create"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${
                  !sidebarOpen ? 'justify-center' : ''
                }`}
                title="Yeni Anı"
              >
                <Plus className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="font-semibold">Yeni Anı</span>}
              </Link>
            </nav>
          </div>
        </aside>
      )}

      {/* Thin Navbar - Above Sidebar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
        <div className="flex h-full items-center justify-between px-4 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3" style={{ width: session?.user && !isMobile ? (sidebarOpen ? '256px' : '64px') : 'auto' }}>
            {session?.user && isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            )}
            {!session?.user && (
              <BrandLogo variant="full" className="h-6 shrink-0 transition-opacity hover:opacity-80" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LocaleSwitcher />
            {session?.user ? (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                </Button>
                {session.user.isAdmin && (
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href="/admin">
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <UserMenu user={session.user} />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild size="sm" className="hidden sm:inline-flex h-8 text-xs">
                  <Link href="/login">Giriş Yap</Link>
                </Button>
                <Button asChild size="sm" className="h-8 text-xs">
                  <Link href="/login">Başla</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {session?.user && isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-12 bottom-0 z-50 w-64 border-r border-border/40 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
            <div className="flex h-full flex-col p-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/create"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 mt-4 bg-primary text-primary-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-semibold">Yeni Anı</span>
                </Link>
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Bottom Navigation - Mobile */}
      {session?.user && isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80 safe-area-bottom">
          <div className="flex h-16 items-center justify-around px-2 max-w-[1920px] mx-auto">
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors min-w-0 flex-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/create"
              className="flex items-center justify-center -mt-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Plus className="h-5 w-5" />
              </div>
            </Link>
            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors min-w-0 flex-1 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Spacer for navbar */}
      <div className="h-12" />
    </>
  );
}
