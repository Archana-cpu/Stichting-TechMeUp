'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Textarea,
  Separator,
} from '@seq/ui';
import {
  Palette,
  Image as ImageIcon,
  Type,
  Save,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { themes, type ThemeId } from '@seq/config/themes';
import { locales, localeNames } from '@seq/i18n';
import type { SystemSettings } from '@seq/database';
import { updateAdminSettings, getUploadUrl } from '@/app/actions';
import { toast } from '@seq/ui';

// ============================================================================
// PROPS
// ============================================================================

type BrandingFormProps = {
  settings: SystemSettings | null;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function BrandingForm({ settings: initialSettings }: BrandingFormProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [settings, setSettings] = useState(initialSettings || {
    id: 'system',
    appName: 'Sequences',
    appDescription: null,
    logoLight: null,
    logoDark: null,
    faviconLight: null,
    faviconDark: null,
    primaryColor: '262 83% 58%',
    accentColor: '262 83% 58%',
    defaultTheme: 'dark-calm',
    defaultLocale: 'en',
    fontHeading: 'Geist Sans',
    fontBody: 'Geist Sans',
    maintenanceMode: false,
    registrationEnabled: true,
    inviteOnlyMode: false,
    quotesEnabled: true,
    splashQuotes: true,
    dailyQuoteNotif: true,
    maxSequencesPerUser: 0,
    maxPeoplePerUser: 0,
    maxMemoriesPerUser: 0,
    updatedAt: new Date(),
  });
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleChange = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleFileUpload = async (field: 'logoLight' | 'logoDark' | 'faviconLight' | 'faviconDark', file: File) => {
    setUploading(field);
    try {
      const result = await getUploadUrl({
        filename: file.name,
        contentType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
        size: file.size,
        folder: 'branding',
      });

      if (!result.success || !result.data) {
        toast.error('Failed to get upload URL');
        return;
      }

      // Upload to R2
      const uploadResponse = await fetch(result.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        toast.error('Failed to upload image');
        return;
      }

      // Update settings with public URL
      handleChange(field, result.data.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAdminSettings(settings as any);
      if (result.success) {
        setHasChanges(false);
        toast.success('Branding settings saved');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    });
  };

  const handleReset = () => {
    setSettings(initialSettings || settings);
    setHasChanges(false);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-end gap-2">
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

      {/* Brand Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Brand Identity
          </CardTitle>
          <CardDescription>
            Set your application name, description, and logos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>App Name</Label>
              <Input
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
                placeholder="Sequences"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>App Description</Label>
            <Textarea
              value={settings.appDescription || ''}
              onChange={(e) => handleChange('appDescription', e.target.value)}
              rows={3}
              placeholder="A modern wellbeing app for tracking emotional sequences"
            />
          </div>

          <Separator />

          {/* Logo Uploads */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Logos</Label>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Light Mode Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={settings.logoLight || ''}
                    onChange={(e) => handleChange('logoLight', e.target.value || null)}
                    placeholder="URL or upload file"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('logoLight', file);
                      }}
                      disabled={uploading === 'logoLight'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading === 'logoLight'}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </label>
                </div>
                {settings.logoLight && (
                  <div className="mt-2">
                    <img
                      src={settings.logoLight}
                      alt="Light logo preview"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dark Mode Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={settings.logoDark || ''}
                    onChange={(e) => handleChange('logoDark', e.target.value || null)}
                    placeholder="URL or upload file"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('logoDark', file);
                      }}
                      disabled={uploading === 'logoDark'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading === 'logoDark'}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </label>
                </div>
                {settings.logoDark && (
                  <div className="mt-2">
                    <img
                      src={settings.logoDark}
                      alt="Dark logo preview"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Light Mode Favicon</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={settings.faviconLight || ''}
                    onChange={(e) => handleChange('faviconLight', e.target.value || null)}
                    placeholder="URL or upload file"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('faviconLight', file);
                      }}
                      disabled={uploading === 'faviconLight'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading === 'faviconLight'}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </label>
                </div>
                {settings.faviconLight && (
                  <div className="mt-2">
                    <img
                      src={settings.faviconLight}
                      alt="Light favicon preview"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dark Mode Favicon</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={settings.faviconDark || ''}
                    onChange={(e) => handleChange('faviconDark', e.target.value || null)}
                    placeholder="URL or upload file"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('faviconDark', file);
                      }}
                      disabled={uploading === 'faviconDark'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading === 'faviconDark'}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </label>
                </div>
                {settings.faviconDark && (
                  <div className="mt-2">
                    <img
                      src={settings.faviconDark}
                      alt="Dark favicon preview"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
              </div>
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
              Colors
            </CardTitle>
            <CardDescription>
              Customize primary and accent colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color (HSL)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="262 83% 58%"
                />
                <div
                  className="h-10 w-10 rounded-lg border shrink-0"
                  style={{ backgroundColor: `hsl(${settings.primaryColor})` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Format: H S% L% (e.g., &quot;262 83% 58%&quot;)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Accent Color (HSL)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={settings.accentColor}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  placeholder="262 83% 58%"
                />
                <div
                  className="h-10 w-10 rounded-lg border shrink-0"
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
              Typography
            </CardTitle>
            <CardDescription>
              Set heading and body fonts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Input
                value={settings.fontHeading}
                onChange={(e) => handleChange('fontHeading', e.target.value)}
                placeholder="Geist Sans"
              />
            </div>
            <div className="space-y-2">
              <Label>Body Font</Label>
              <Input
                value={settings.fontBody}
                onChange={(e) => handleChange('fontBody', e.target.value)}
                placeholder="Geist Sans"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Default Settings</CardTitle>
          <CardDescription>
            Set default theme and locale for new users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Theme</Label>
              <select
                value={settings.defaultTheme}
                onChange={(e) => handleChange('defaultTheme', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.keys(themes).map((themeId) => (
                  <option key={themeId} value={themeId}>
                    {themes[themeId as ThemeId].mode === 'dark' ? '🌙' : '☀️'}{' '}
                    {themes[themeId as ThemeId].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Default Locale</Label>
              <select
                value={settings.defaultLocale}
                onChange={(e) => handleChange('defaultLocale', e.target.value as 'en' | 'tr' | 'nl')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locales.map((locale) => (
                  <option key={locale} value={locale}>
                    {localeNames[locale]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
