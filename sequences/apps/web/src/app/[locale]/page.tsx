import { auth } from '@seq/auth';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  let session = null;
  try {
    session = await auth();
  } catch {
    // Invalid/expired JWT token - treat as unauthenticated
  }

  // Redirect based on auth status
  redirect(session?.user ? `/${locale}/storyboard` : `/${locale}/login`);
}
