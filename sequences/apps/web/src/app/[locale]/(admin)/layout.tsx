import { auth } from '@seq/auth';
import { redirect } from 'next/navigation';
import { AdminLayout as AdminLayoutWrapper } from '@/components/admin/admin-layout';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminRouteLayout({ children, params }: LayoutProps) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(admin)/layout.tsx:10',message:'AdminLayout entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const session = await auth();
  const { locale } = await params;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(admin)/layout.tsx:14',message:'AdminLayout session check',data:{hasSession:!!session,hasUser:!!session?.user,isAdmin:session?.user?.isAdmin,userId:session?.user?.id,locale},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  // Redirect non-admin users
  if (!session?.user?.isAdmin) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(admin)/layout.tsx:18',message:'Redirecting non-admin to storyboard',data:{locale},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    redirect(`/${locale}/storyboard`);
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'(admin)/layout.tsx:21',message:'AdminLayout success - rendering admin content',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
