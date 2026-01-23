import { auth } from "@seq/auth";
import { redirect } from "next/navigation";
import { db } from "@seq/database";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: LayoutProps) {
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "(protected)/layout.tsx:11",
      message: "ProtectedLayout entry",
      data: {},
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const session = await auth();
  const { locale } = await params;

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "(protected)/layout.tsx:15",
      message: "Session check",
      data: {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        locale,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  // Redirect unauthenticated users to login
  if (!session?.user) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "(protected)/layout.tsx:18",
        message: "Redirecting to login",
        data: { locale },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    redirect(`/${locale}/login`);
  }

  // Check if user needs onboarding or email verification
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true, emailVerified: true },
  });

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "(protected)/layout.tsx:27",
      message: "User check",
      data: {
        userId: session.user.id,
        onboardingComplete: user?.onboardingComplete,
        emailVerified: user?.emailVerified,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  // Email verification check (optional - can be enforced via env var)
  if (
    process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
    !user?.emailVerified
  ) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "(protected)/layout.tsx:30",
        message: "Redirecting to verify-email",
        data: { locale },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    redirect(`/${locale}/verify-email`);
  }

  // Onboarding check - redirect if not completed (null or false)
  if (!user?.onboardingComplete) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "(protected)/layout.tsx:35",
        message: "Redirecting to onboarding",
        data: { locale, onboardingComplete: user?.onboardingComplete },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    redirect(`/${locale}/onboarding`);
  }

  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/d9701ca4-b5ae-4574-8484-12596633538b", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "(protected)/layout.tsx:38",
      message: "ProtectedLayout success - rendering children",
      data: {},
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion

  return <>{children}</>;
}
