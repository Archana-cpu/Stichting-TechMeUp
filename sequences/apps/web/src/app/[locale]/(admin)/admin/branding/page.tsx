import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { BrandingForm } from '@/components/admin/branding-form';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function BrandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await db.systemSettings.findUnique({
    where: { id: 'system' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Branding & White-Label</h1>
        <p className="text-muted-foreground">
          Customize your application&apos;s appearance, logos, colors, and branding
        </p>
      </div>
      
      <BrandingForm settings={settings} />
    </div>
  );
}
