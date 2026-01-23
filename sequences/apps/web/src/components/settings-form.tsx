'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@seq/ui';
import { Palette, Globe, Bell, Shield } from 'lucide-react';
import { themes, type ThemeId } from '@seq/config/themes';
import { locales, localeNames, type Locale } from '@seq/i18n';
import type { UserSettings } from '@seq/database';
import { updateUserSettings } from '@/app/actions';

type SettingsFormProps = {
  user: {
    id: string;
    theme: string;
    locale: string;
  };
  settings: UserSettings | null;
};

export function SettingsForm({ user, settings }: SettingsFormProps) {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme.startsWith('dark') ? 'dark' : 'light');
    startTransition(async () => {
      await updateUserSettings({ theme: newTheme });
    });
  };

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(async () => {
      const result = await updateUserSettings({ locale: newLocale });
      if (result.success) {
        window.location.href = `/${newLocale}/settings`;
      }
    });
  };

  const handleSettingChange = (key: string, value: boolean) => {
    startTransition(async () => {
      await updateUserSettings({ [key]: value } as any);
    });
  };

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
      <div className="w-full max-w-[1920px] mx-auto px-6 py-8">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold gradient-text">{t('title')}</h1>
        <p className="text-muted-foreground">Customize your experience</p>
      </div>

      <div className="inline-flex gap-6 min-w-max">
        <Card className="vintage-card hover-lift">
          <CardHeader className="card-enhanced-header">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              {t('appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="form-enhanced">
            <div className="form-group">
              <Label className="text-sm font-semibold mb-3">{t('theme')}</Label>
              <Select value={user.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="h-12 border-2 focus:border-primary vintage-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(themes).map((themeId) => (
                    <SelectItem key={themeId} value={themeId}>
                      {themes[themeId as ThemeId].mode === 'dark' ? '🌙' : '☀️'}{' '}
                      {themes[themeId as ThemeId].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label className="text-sm font-semibold flex items-center gap-2.5 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                {t('language')}
              </Label>
              <Select value={user.locale} onValueChange={handleLocaleChange}>
                <SelectTrigger className="h-12 border-2 focus:border-primary vintage-input">
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
          </CardContent>
        </Card>

        <Card className="vintage-card hover-lift">
          <CardHeader className="card-enhanced-header">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="form-enhanced">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
              <Label className="text-sm font-semibold">Email Notifications</Label>
              <Switch
                checked={settings?.emailNotifications ?? true}
                onCheckedChange={(v) => handleSettingChange('emailNotifications', v)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
              <Label className="text-sm font-semibold">Push Notifications</Label>
              <Switch
                checked={settings?.pushNotifications ?? true}
                onCheckedChange={(v) => handleSettingChange('pushNotifications', v)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="vintage-card hover-lift w-96">
          <CardHeader className="card-enhanced-header">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              {t('privacy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Public Profile</Label>
                  <p className="text-xs text-muted-foreground">Make your profile visible to others</p>
                </div>
                <Switch
                  checked={settings?.publicProfile ?? false}
                  onCheckedChange={(v) => handleSettingChange('publicProfile', v)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              <div className="flex items-center justify-between p-5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-all">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Show in People Search</Label>
                  <p className="text-xs text-muted-foreground">Allow others to find you</p>
                </div>
                <Switch
                  checked={settings?.showInPeopleSearch ?? true}
                  onCheckedChange={(v) => handleSettingChange('showInPeopleSearch', v)}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
