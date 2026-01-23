import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/login-form';
import type { Locale } from '@seq/i18n';

type PageProps = {
  params: Promise<{ locale: Locale }>;
};

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 relative animated-mesh-bg blur-background light-rays noise-texture">
      {/* Enhanced decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/6 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>
      <div className="relative z-10 w-full">
        <LoginForm />
      </div>
    </div>
  );
}
