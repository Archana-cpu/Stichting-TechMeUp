import { auth } from '@seq/auth';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { db } from '@seq/database';
import { OnboardingWizard } from '@/components/onboarding';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Check if user already completed onboarding
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, onboardingComplete: true },
  });

  if (user?.onboardingComplete) {
    redirect(`/${locale}/storyboard`);
  }

  const [emotions, triggers] = await Promise.all([
    db.emotion.findMany(),
    db.trigger.findMany(),
  ]);

  return (
    <OnboardingWizard
      user={{
        id: session.user.id,
        name: user?.name ?? null,
        email: user?.email ?? session.user.email,
      }}
      emotions={emotions}
      triggers={triggers}
    />
  );
}
