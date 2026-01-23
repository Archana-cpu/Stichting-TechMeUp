'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@seq/ui';
import {
  Palette,
  Type,
  Image,
  Settings,
  Shield,
  Bell,
  Save,
  RotateCcw,
} from 'lucide-react';
import { themes, type ThemeId } from '@seq/config/themes';
import { locales, localeNames } from '@seq/i18n';
import type { SystemSettings as SystemSettingsType } from '@seq/database';
import { updateAdminSettings } from '@/app/actions';

// ============================================================================
// PROPS
// ============================================================================

type SystemSettingsProps = {
  settings: SystemSettingsType;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SystemSettings({ settings: initialSettings }: SystemSettingsProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = <K extends keyof SystemSettingsType>(
    key: K,
    value: SystemSettingsType[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAdminSettings(settings as any);
      if (result.success) {
        setHasChanges(false);
      } else {
        console.error('Failed to save settings:', result.error);
      }
    });
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('systemSettings')}</h2>
          <p className="text-sm text-muted-foreground">
            Configure your application settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? 'Saving...' : tCommon('save')}
          </Button>
        </div>
      </div>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            {t('branding')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('appName')}</Label>
              <Input
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('appDescription')}</Label>
            <Textarea
              value={settings.appDescription || ''}
              onChange={(e) => handleChange('appDescription', e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('logoLight')}</Label>
              <Input
                value={settings.logoLight || ''}
                onChange={(e) => handleChange('logoLight', e.target.value)}
                placeholder="URL to light mode logo"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('logoDark')}</Label>
              <Input
                value={settings.logoDark || ''}
                onChange={(e) => handleChange('logoDark', e.target.value)}
                placeholder="URL to dark mode logo"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('faviconLight')}</Label>
              <Input
                value={settings.faviconLight || ''}
                onChange={(e) => handleChange('faviconLight', e.target.value)}
                placeholder="URL to light mode favicon"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('faviconDark')}</Label>
              <Input
                value={settings.faviconDark || ''}
                onChange={(e) => handleChange('faviconDark', e.target.value)}
                placeholder="URL to dark mode favicon"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors & Typography */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('colors')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('primaryColor')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="262 83% 58%"
                />
                <div
                  className="h-10 w-10 rounded-lg border"
                  style={{ backgroundColor: `hsl(${settings.primaryColor})` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">HSL format: H S% L%</p>
            </div>
            <div className="space-y-2">
              <Label>{t('accentColor')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={settings.accentColor}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  placeholder="262 83% 58%"
                />
                <div
                  className="h-10 w-10 rounded-lg border"
                  style={{ backgroundColor: `hsl(${settings.accentColor})` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              {t('typography')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('fontHeading')}</Label>
              <Input
                value={settings.fontHeading}
                onChange={(e) => handleChange('fontHeading', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('fontBody')}</Label>
              <Input
                value={settings.fontBody}
                onChange={(e) => handleChange('fontBody', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('defaults')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('defaultTheme')}</Label>
              <Select
                value={settings.defaultTheme}
                onValueChange={(v) => handleChange('defaultTheme', v)}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>{t('defaultLocale')}</Label>
              <Select
                value={settings.defaultLocale}
                onValueChange={(v) => handleChange('defaultLocale', v)}
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
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('features')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>{t('maintenanceMode')}</Label>
                <p className="text-xs text-muted-foreground">
                  Disable access for non-admin users
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(v) => handleChange('maintenanceMode', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>{t('registrationEnabled')}</Label>
                <p className="text-xs text-muted-foreground">
                  Allow new user registrations
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(v) => handleChange('registrationEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>{t('inviteOnlyMode')}</Label>
                <p className="text-xs text-muted-foreground">
                  Require invitation to register
                </p>
              </div>
              <Switch
                checked={settings.inviteOnlyMode}
                onCheckedChange={(v) => handleChange('inviteOnlyMode', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quotes & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>{t('quotesEnabled')}</Label>
              <Switch
                checked={settings.quotesEnabled}
                onCheckedChange={(v) => handleChange('quotesEnabled', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>{t('splashQuotes')}</Label>
              <Switch
                checked={settings.splashQuotes}
                onCheckedChange={(v) => handleChange('splashQuotes', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>{t('dailyQuoteNotif')}</Label>
              <Switch
                checked={settings.dailyQuoteNotif}
                onCheckedChange={(v) => handleChange('dailyQuoteNotif', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle>{t('limits')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('unlimitedHint')}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t('maxSequencesPerUser')}</Label>
              <Input
                type="number"
                min={0}
                value={settings.maxSequencesPerUser}
                onChange={(e) => handleChange('maxSequencesPerUser', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('maxPeoplePerUser')}</Label>
              <Input
                type="number"
                min={0}
                value={settings.maxPeoplePerUser}
                onChange={(e) => handleChange('maxPeoplePerUser', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('maxMemoriesPerUser')}</Label>
              <Input
                type="number"
                min={0}
                value={settings.maxMemoriesPerUser}
                onChange={(e) => handleChange('maxMemoriesPerUser', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
