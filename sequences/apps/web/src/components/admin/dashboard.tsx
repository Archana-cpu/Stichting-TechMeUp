'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Switch, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, 
  Button, Input, Separator, Badge
} from '@seq/ui';
import { 
  Users, Film, Settings, Palette, Globe, TrendingUp, 
  Quote, UserPlus, Activity, ArrowRight, Shield, Clock
} from 'lucide-react';
import { colorPalettes, type ColorPaletteId } from '@seq/config/design-system';
import { locales, localeNames } from '@seq/i18n';
import type { SystemSettings } from '@seq/database';
import { updateAdminSettings } from '@/app/actions';

type AdminDashboardProps = {
  stats: {
    userCount: number;
    sequenceCount: number;
    quoteCount?: number;
    recentUsers?: number;
    activeToday?: number;
  };
  systemSettings: SystemSettings | null;
  recentActivity?: {
    users: Array<{
      id: string;
      name: string | null;
      username: string | null;
      email: string | null;
      image: string | null;
      createdAt: Date;
    }>;
    sequences: Array<{
      id: string;
      title: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
        username: string | null;
      };
    }>;
  };
};

export function AdminDashboard({ stats, systemSettings, recentActivity }: AdminDashboardProps) {
  const t = useTranslations('admin');
  const tSettings = useTranslations('settings');
  const [isPending, startTransition] = useTransition();

  const handleSettingsUpdate = (key: string, value: string | boolean) => {
    startTransition(async () => {
      await updateAdminSettings({ [key]: value } as any);
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          Manage your application settings and monitor activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+{stats.recentUsers || 0}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sequences</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sequenceCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              Growing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quotes</CardTitle>
            <Quote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quoteCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Wisdom database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={systemSettings?.maintenanceMode ? 'destructive' : 'default'} className="rounded-full">
                {systemSettings?.maintenanceMode ? 'Maintenance' : 'Online'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 inline mr-1" />
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/users">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>
                View and manage all users, roles, and permissions
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/quotes">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Quote className="h-5 w-5 text-purple-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Quotes Manager</CardTitle>
              <CardDescription>
                Add, edit, and manage inspirational quotes
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/admin/settings">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Settings className="h-5 w-5 text-green-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">System Settings</CardTitle>
              <CardDescription>
                Configure app branding, theme, and features
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>
                Latest user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent users
                  </p>
                ) : (
                  recentActivity.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {user.name?.[0] || user.username?.[0] || user.email?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || user.username || user.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Recent Sequences
              </CardTitle>
              <CardDescription>
                Latest sequence creations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.sequences.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent sequences
                  </p>
                ) : (
                  recentActivity.sequences.map((sequence) => (
                    <div
                      key={sequence.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        <Film className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {sequence.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {sequence.user.name || sequence.user.username || 'Unknown'} • {new Date(sequence.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Settings
          </CardTitle>
          <CardDescription>
            Frequently used settings for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* App Name */}
            <div className="space-y-2">
              <Label>App Name</Label>
              <Input
                defaultValue={systemSettings?.appName || 'Sequences'}
                onBlur={(e) => handleSettingsUpdate('appName', e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Default Palette */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Default Palette
              </Label>
              <Select
                defaultValue={systemSettings?.defaultTheme || 'serenity'}
                onValueChange={(value) => handleSettingsUpdate('defaultTheme', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(colorPalettes).map((paletteId) => (
                    <SelectItem key={paletteId} value={paletteId}>
                      {colorPalettes[paletteId as ColorPaletteId].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Locale */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {tSettings('language')}
              </Label>
              <Select
                defaultValue={systemSettings?.defaultLocale || 'en'}
                onValueChange={(value) => handleSettingsUpdate('defaultLocale', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((locale) => (
                    <SelectItem key={locale} value={locale}>
                      {localeNames[locale]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label className="text-sm font-medium">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Disable access for non-admin users
                </p>
              </div>
              <Switch
                checked={systemSettings?.maintenanceMode || false}
                onCheckedChange={(checked) => handleSettingsUpdate('maintenanceMode', checked)}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label className="text-sm font-medium">Registration</Label>
                <p className="text-xs text-muted-foreground">
                  Allow new user sign-ups
                </p>
              </div>
              <Switch
                checked={systemSettings?.registrationEnabled ?? true}
                onCheckedChange={(checked) => handleSettingsUpdate('registrationEnabled', checked)}
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
