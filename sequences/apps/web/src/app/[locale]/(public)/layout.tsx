import { auth } from '@seq/auth';
import { redirect } from 'next/navigation';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({ children, params }: LayoutProps) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(public)/layout.tsx:9',message:'PublicLayout entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  let session = null;
  try {
    session = await auth();
  } catch {
    // Invalid/expired JWT token - treat as unauthenticated
  }
  const { locale } = await params;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(public)/layout.tsx:18',message:'PublicLayout session check',data:{hasSession:!!session,hasUser:!!session?.user,userId:session?.user?.id,locale},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Redirect authenticated users to storyboard
  if (session?.user) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(public)/layout.tsx:22',message:'Redirecting authenticated user to storyboard',data:{locale},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    redirect(`/${locale}/storyboard`);
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(public)/layout.tsx:26',message:'PublicLayout success - rendering children',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return <>{children}</>;
}
