'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@seq/ui';
import {
  Users,
  Film,
  BookMarked,
  Activity,
  Settings,
  FileText,
  Quote,
  ClipboardList,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ============================================================================
// PROPS
// ============================================================================

type AdminDashboardProps = {
  stats: {
    totalUsers: number;
    totalSequences: number;
    totalMemories: number;
    activeToday: number;
    newUsersThisWeek: number;
    newSequencesThisWeek: number;
    usersGrowth: number;
    sequencesGrowth: number;
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const t = useTranslations('admin');

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.usersGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stats.usersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.usersGrowth > 0 ? '+' : ''}{stats.usersGrowth}%
              </span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalSequences')}</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSequences.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.sequencesGrowth >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stats.sequencesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.sequencesGrowth > 0 ? '+' : ''}{stats.sequencesGrowth}%
              </span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('totalMemories')}</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMemories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newSequencesThisWeek} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('activeToday')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeToday / stats.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/settings">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t('systemSettings')}</h3>
                <p className="text-sm text-muted-foreground">Configure app settings</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('users')}</h3>
                <p className="text-sm text-muted-foreground">Manage users</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/quotes">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-amber-500/10 p-3">
                <Quote className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('quotes')}</h3>
                <p className="text-sm text-muted-foreground">Manage quotes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/content">
          <Card className="cursor-pointer transition-colors hover:bg-accent">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-green-500/10 p-3">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">{t('contentBlocks')}</h3>
                <p className="text-sm text-muted-foreground">Manage content</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Audit Log Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Link href="/admin/audit" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent admin actions will appear here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
