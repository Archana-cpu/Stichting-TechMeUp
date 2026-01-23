---
name: Sequences App Build
overview: Production-ready, Co-Star style wellbeing app with infinite canvas, comprehensive testing, security hardening, and white-label admin panel. Next.js 16.1 / January 2026 best practices.
todos:
  - id: cleanup-actions
    content: Consolidate actions/ folder into single app/actions.ts file
    status: pending
  - id: delete-hero
    content: Delete hero.tsx and update root page to redirect
    status: pending
  - id: route-groups
    content: Create route groups with layout-based auth guards (no middleware)
    status: pending
  - id: minimal-login
    content: Refine login form to Co-Star minimal style
    status: pending
  - id: install-xyflow
    content: Install @xyflow/react package
    status: pending
  - id: storyboard-canvas
    content: Create Storyboard canvas with React Flow and Instax nodes
    status: pending
  - id: lifetree-canvas
    content: Create LifeTree canvas with person nodes and relationship edges
    status: pending
  - id: lifetree-page
    content: Create /lifetree page route
    status: pending
  - id: instax-styles
    content: Add Instax/Polaroid card styles to globals.css
    status: pending
  - id: admin-sidebar
    content: Create admin sidebar layout using shadcn blocks
    status: pending
  - id: admin-dashboard
    content: Enhance admin dashboard with stats cards
    status: pending
  - id: admin-users
    content: Implement users DataTable with full CRUD
    status: pending
  - id: admin-quotes
    content: Implement quotes manager with multi-language support
    status: pending
  - id: admin-whitelabel
    content: Create white-label settings (logo, colors, fonts, content)
    status: pending
  - id: photo-storage
    content: Implement Cloudflare R2 photo upload with signed URLs
    status: pending
  - id: email-verification
    content: Add email verification flow with Resend
    status: pending
  - id: vitest-setup
    content: Configure Vitest with React Testing Library
    status: pending
  - id: playwright-setup
    content: Configure Playwright E2E tests
    status: pending
  - id: type-safety
    content: Add strict TypeScript configs and Zod schemas
    status: pending
  - id: security-headers
    content: Implement security headers and CSP
    status: pending
  - id: rate-limiting
    content: Add rate limiting to API routes and actions
    status: pending
  - id: onboarding-refine
    content: Refine onboarding wizard with palette/font selection
    status: pending
  - id: profile-charts
    content: Add emotion charts to profile page
    status: pending
  - id: messages-view
    content: Implement messages conversation view
    status: pending
---

# Sequences App - Complete Implementation Plan

**Next.js 16.1 / January 2026 Best Practices**

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase 1: Cleanup & Auth Flow](#phase-1-cleanup-and-auth-flow)
3. [Phase 2: Infinite Canvas](#phase-2-infinite-canvas-implementation)
4. [Phase 3: Photo Storage & Media](#phase-3-photo-storage--media)
5. [Phase 4: Email Verification](#phase-4-email-verification)
6. [Phase 5: Admin Panel (White-Label)](#phase-5-admin-panel-white-label)
7. [Phase 6: Testing (Vitest + Playwright)](#phase-6-testing-vitest--playwright)
8. [Phase 7: Security Hardening](#phase-7-security-hardening)
9. [Phase 8: Performance Optimization](#phase-8-performance-optimization)
10. [Phase 9: Type Safety & Edge Cases](#phase-9-type-safety--edge-cases)
11. [Phase 10: Scalability](#phase-10-scalability)
12. [Developer Feedback](#developer-feedback)

---

## Current State Analysis

**Already Working:**

- Tailwind v4 with PostCSS properly configured
- 8 color palettes with dark/light modes in CSS variables
- NextAuth + Google OAuth configured
- Prisma schema complete (User, Sequence, Person, Memory, etc.)
- Basic login form, admin dashboard, storyboard components exist
- i18n setup (EN, TR, NL)

**Needs Cleanup (Next.js 16 Best Practices):**

- `apps/web/src/actions/` folder (7 files) -> consolidate to single `app/actions.ts`
- `apps/web/src/components/hero.tsx` -> DELETE (login-first)
- No route groups for auth -> CREATE with layout-based guards

**Missing (To Implement):**

- Photo/media storage (Cloudflare R2)
- Email verification
- Comprehensive testing (Vitest + Playwright)
- Security headers, CSP, rate limiting
- White-label admin panel
- Performance optimizations

---

## Phase 1: Cleanup and Auth Flow

### 1.1 Auth Guards via Layout-Based Redirects (NO middleware/proxy)

Next.js 16 deprecates `middleware.ts`. Handle auth in Server Component layouts using `redirect()`.

**New Route Structure:**

```
app/[locale]/
├── (public)/                    # No auth required
│   ├── login/page.tsx
│   └── layout.tsx               # Redirect authenticated users
├── (protected)/                 # Auth required
│   ├── storyboard/page.tsx
│   ├── lifetree/page.tsx
│   ├── profile/page.tsx
│   ├── messages/page.tsx
│   ├── create/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx               # Auth guard + onboarding + email verification check
├── (admin)/                     # Admin only
│   ├── admin/
│   │   ├── page.tsx             # Dashboard
│   │   ├── users/page.tsx
│   │   ├── quotes/page.tsx
│   │   ├── branding/page.tsx    # White-label settings
│   │   └── settings/page.tsx
│   └── layout.tsx               # isAdmin check
├── onboarding/page.tsx
├── verify-email/page.tsx        # Email verification
├── page.tsx                     # Root redirect
└── layout.tsx                   # Main layout
```

**Protected Layout** (`(protected)/layout.tsx`):

```tsx
import { auth } from "@seq/auth";
import { redirect } from "next/navigation";
import { db } from "@seq/database";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true, emailVerified: true },
  });

  // Email verification check (optional - can be enforced)
  if (!user?.emailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
    redirect(`/${locale}/verify-email`);
  }

  if (!user?.onboardingComplete) {
    redirect(`/${locale}/onboarding`);
  }

  return <>{children}</>;
}
```

### 1.2 Consolidate Server Actions

**Create** `apps/web/src/app/actions.ts` - Single file with all server actions:

```tsx
"use server";

import { auth } from "@seq/auth";
import { db } from "@seq/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// ============================================================================
// TYPES
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; code?: string };

// ============================================================================
// HELPER: Auth Check
// ============================================================================

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// ============================================================================
// SEQUENCE ACTIONS
// ============================================================================

const createSequenceSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  eventDate: z.string().datetime(),
  emotionId: z.number().int().positive(),
  // ... full schema
});

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>;

export async function createSequence(input: CreateSequenceInput): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    
    // Rate limit: 10 sequences per minute
    const { success } = await rateLimit(`sequence:${user.id}`, 10, 60);
    if (!success) {
      return { success: false, error: "Rate limit exceeded", code: "RATE_LIMITED" };
    }
    
    const validated = createSequenceSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.message, code: "VALIDATION_ERROR" };
    }

    const sequence = await db.sequence.create({
      data: { ...validated.data, userId: user.id },
    });

    revalidatePath("/[locale]/storyboard");
    return { success: true, data: { id: sequence.id } };
  } catch (error) {
    console.error("createSequence error:", error);
    return { success: false, error: "Failed to create sequence" };
  }
}

// ... other sequence actions (update, delete, reorder)

// ============================================================================
// PEOPLE ACTIONS
// ============================================================================

// ... createPerson, updatePerson, deletePerson, updatePersonPosition

// ============================================================================
// SETTINGS ACTIONS
// ============================================================================

// ... updateUserSettings, getUserSettings

// ============================================================================
// ADMIN ACTIONS
// ============================================================================

// ... updateSystemSettings, updateBranding, manageUsers, manageQuotes

// ============================================================================
// PHOTO UPLOAD ACTIONS
// ============================================================================

export async function getUploadUrl(input: { filename: string; contentType: string }): Promise<ActionResult<{ uploadUrl: string; publicUrl: string }>> {
  // Generate signed URL for R2 upload
}

// ============================================================================
// EMAIL VERIFICATION ACTIONS
// ============================================================================

export async function sendVerificationEmail(): Promise<ActionResult> {
  // Send verification email via Resend
}

export async function verifyEmail(input: { code: string }): Promise<ActionResult> {
  // Verify email code
}
```

### 1.3 Delete Unnecessary Files

**DELETE:**

- `apps/web/src/components/hero.tsx`
- `apps/web/src/actions/` (entire folder)

### 1.4 Update Root Page

```tsx
// apps/web/src/app/[locale]/page.tsx
import { auth } from "@seq/auth";
import { redirect } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  redirect(session?.user ? `/${locale}/storyboard` : `/${locale}/login`);
}
```

### 1.5 Minimal Login Page (Co-Star Style)

```tsx
// Simplified login-form.tsx
"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@seq/ui";

export function LoginForm() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto text-center space-y-8"
    >
      {/* Logo */}
      <div className="space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">✦</span>
        </div>
        <h1 className="font-heading text-2xl">Sequences</h1>
        <p className="text-muted-foreground text-sm">
          hayat hikayeni yaz
        </p>
      </div>

      {/* Google Sign In */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/storyboard" })}
      >
        <GoogleIcon className="mr-2 h-5 w-5" />
        Google ile devam et
      </Button>

      {/* Terms */}
      <p className="text-xs text-muted-foreground">
        Devam ederek{" "}
        <a href="/terms" className="underline">Kullanım Koşulları</a>
        {" "}ve{" "}
        <a href="/privacy" className="underline">Gizlilik Politikası</a>
        'nı kabul edersiniz.
      </p>
    </motion.div>
  );
}
```

---

## Phase 2: Infinite Canvas Implementation

### 2.1 Install Dependencies

```bash
pnpm add @xyflow/react --filter=@seq/web
```

### 2.2 Storyboard Canvas

**Create** `apps/web/src/components/storyboard/storyboard-flow.tsx`:

```tsx
"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InstaxNode } from "./nodes/instax-node";
import { MemoryEdge } from "./edges/memory-edge";
import type { Sequence } from "@seq/database";

const nodeTypes = { instax: InstaxNode };
const edgeTypes = { memory: MemoryEdge };

type Props = {
  sequences: Sequence[];
  onNodePositionChange: (id: string, x: number, y: number) => void;
};

export function StoryboardFlow({ sequences, onNodePositionChange }: Props) {
  const initialNodes: Node[] = useMemo(
    () =>
      sequences.map((seq, i) => ({
        id: seq.id,
        type: "instax",
        position: { x: seq.positionX ?? i * 300, y: seq.positionY ?? 0 },
        data: { sequence: seq },
      })),
    [sequences]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      onNodePositionChange(node.id, node.position.x, node.position.y);
    },
    [onNodePositionChange]
  );

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls />
        <MiniMap
          nodeColor={(n) => (n.type === "instax" ? "var(--primary)" : "#ccc")}
          maskColor="rgba(0,0,0,0.1)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
```

### 2.3 Instax/Polaroid Node

**Create** `apps/web/src/components/storyboard/nodes/instax-node.tsx`:

```tsx
"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Sequence } from "@seq/database";

type InstaxNodeData = {
  sequence: Sequence;
};

export const InstaxNode = memo(function InstaxNode({
  data,
  selected,
}: NodeProps<InstaxNodeData>) {
  const { sequence } = data;

  // Random slight rotation for authentic polaroid feel
  const rotation = useMemo(
    () => (Math.random() - 0.5) * 6, // -3 to +3 degrees
    []
  );

  return (
    <>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <motion.div
        className={cn(
          "instax-card cursor-grab active:cursor-grabbing transition-shadow",
          selected && "ring-2 ring-primary shadow-2xl"
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Photo Area */}
        <div className="w-48 h-48 bg-muted rounded overflow-hidden">
          {sequence.image ? (
            <Image
              src={sequence.image}
              alt={sequence.title}
              width={192}
              height={192}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {sequence.emotion?.icon || "📷"}
            </div>
          )}
        </div>

        {/* Caption Area */}
        <div className="mt-2 text-center">
          <p className="font-medium text-sm line-clamp-1">{sequence.title}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(sequence.eventDate).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </>
  );
});
```

### 2.4 Instax CSS Styles

**Add to** `packages/ui/src/globals.css`:

```css
/* ============================================================================
   INSTAX/POLAROID CARD STYLES
   ============================================================================ */

.instax-card {
  --instax-frame: 12px;
  --instax-frame-bottom: 48px;
  background: white;
  padding: var(--instax-frame);
  padding-bottom: var(--instax-frame-bottom);
  border-radius: 4px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 10px 30px -5px rgba(0, 0, 0, 0.2);
}

.dark .instax-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

/* Canvas-specific styles */
.react-flow__node-instax {
  /* No default node styles */
}

.react-flow__minimap {
  background: hsl(var(--muted));
  border-radius: var(--radius);
}

.react-flow__controls {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.react-flow__controls-button {
  background: transparent;
  border-bottom: 1px solid hsl(var(--border));
}

.react-flow__controls-button:hover {
  background: hsl(var(--muted));
}
```

### 2.5 LifeTree Canvas

**Create** `apps/web/src/components/lifetree/lifetree-flow.tsx`:

Similar structure to StoryboardFlow but with PersonNode and RelationEdge.

---

## Phase 3: Photo Storage & Media

### 3.1 Cloudflare R2 Setup

**Why R2:**
- S3-compatible API
- No egress fees
- Global CDN included
- Cheaper than S3 for read-heavy workloads

**Install:**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner --filter=@seq/web
```

**Create** `apps/web/src/lib/storage.ts`:

```tsx
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function createUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB default
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeBytes,
  });

  const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
  const publicUrl = `${PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl };
}

export async function deleteFile(key: string) {
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Generate unique file key
export function generateFileKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `users/${userId}/${timestamp}-${random}.${ext}`;
}
```

### 3.2 Upload Action

**Add to** `actions.ts`:

```tsx
const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

export async function getUploadUrl(
  input: z.infer<typeof uploadSchema>
): Promise<ActionResult<{ uploadUrl: string; publicUrl: string; key: string }>> {
  try {
    const user = await requireAuth();
    const validated = uploadSchema.parse(input);

    const key = generateFileKey(user.id, validated.filename);
    const { uploadUrl, publicUrl } = await createUploadUrl(
      key,
      validated.contentType,
      validated.size
    );

    return { success: true, data: { uploadUrl, publicUrl, key } };
  } catch (error) {
    return { success: false, error: "Failed to generate upload URL" };
  }
}
```

### 3.3 Client-Side Upload Component

```tsx
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { getUploadUrl } from "@/app/actions";

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;

      setUploading(true);
      try {
        // 1. Get signed URL
        const result = await getUploadUrl({
          filename: file.name,
          contentType: file.type as any,
          size: file.size,
        });

        if (!result.success) throw new Error(result.error);

        // 2. Upload directly to R2
        await fetch(result.data.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        // 3. Return public URL
        onUpload(result.data.publicUrl);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
    >
      <input {...getInputProps()} />
      {uploading ? "Yükleniyor..." : "Fotoğraf sürükle veya tıkla"}
    </div>
  );
}
```

---

## Phase 4: Email Verification

### 4.1 Setup Resend

```bash
pnpm add resend --filter=@seq/web
```

**Create** `apps/web/src/lib/email.ts`:

```tsx
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string,
  locale: string = "en"
) {
  const subjects = {
    en: "Verify your email - Sequences",
    tr: "E-posta doğrulama - Sequences",
    nl: "Verifieer je e-mail - Sequences",
  };

  await resend.emails.send({
    from: "Sequences <noreply@sequences.app>",
    to: email,
    subject: subjects[locale as keyof typeof subjects] || subjects.en,
    html: getVerificationEmailTemplate(code, locale),
  });
}

function getVerificationEmailTemplate(code: string, locale: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; margin: 0;">Sequences</h1>
        </div>
        <div style="background: #f9fafb; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="margin: 0 0 16px; color: #6b7280;">Doğrulama kodunuz:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
            ${code}
          </div>
          <p style="margin: 16px 0 0; color: #9ca3af; font-size: 14px;">
            Bu kod 10 dakika geçerlidir.
          </p>
        </div>
      </body>
    </html>
  `;
}
```

### 4.2 Database Schema Addition

**Add to** `schema.prisma`:

```prisma
model EmailVerification {
  id        String   @id @default(cuid())
  email     String
  code      String
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([code])
}
```

### 4.3 Verification Actions

**Add to** `actions.ts`:

```tsx
export async function sendVerificationEmail(): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    
    // Rate limit: 3 emails per hour
    const { success } = await rateLimit(`verify-email:${user.id}`, 3, 3600);
    if (!success) {
      return { success: false, error: "Too many requests", code: "RATE_LIMITED" };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in DB
    await db.emailVerification.create({
      data: {
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send email
    await sendVerificationEmail(user.email, code, user.locale);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send verification email" };
  }
}

export async function verifyEmailCode(input: { code: string }): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const verification = await db.emailVerification.findFirst({
      where: {
        email: user.email,
        code: input.code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return { success: false, error: "Invalid or expired code", code: "INVALID_CODE" };
    }

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete used verification codes
    await db.emailVerification.deleteMany({
      where: { email: user.email },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Verification failed" };
  }
}
```

---

## Phase 5: Admin Panel (White-Label)

### 5.1 White-Label Database Schema

**Update** `schema.prisma`:

```prisma
model SystemSettings {
  id                  String   @id @default("system")
  
  // Branding
  appName             String   @default("Sequences")
  appDescription      String?  @db.Text
  tagline             String?
  
  // Logos (R2 URLs)
  logoLight           String?
  logoDark            String?
  logoIcon            String?
  faviconLight        String?
  faviconDark         String?
  
  // Colors (CSS custom properties or hex)
  primaryColor        String   @default("#8b5cf6")
  accentColor         String   @default("#ec4899")
  
  // Theme defaults
  defaultPalette      String   @default("serenity")
  defaultFont         String   @default("elegant")
  defaultTheme        String   @default("dark")
  
  // Locale
  defaultLocale       String   @default("en")
  supportedLocales    String[] @default(["en", "tr", "nl"])
  
  // Feature flags
  maintenanceMode     Boolean  @default(false)
  registrationEnabled Boolean  @default(true)
  inviteOnlyMode      Boolean  @default(false)
  requireEmailVerify  Boolean  @default(false)
  
  // Quotes/Content
  quotesEnabled       Boolean  @default(true)
  splashQuotes        Boolean  @default(true)
  
  // Limits (0 = unlimited)
  maxSequencesPerUser Int      @default(0)
  maxPeoplePerUser    Int      @default(0)
  maxStorageMbPerUser Int      @default(100)
  
  // Social links
  twitterUrl          String?
  instagramUrl        String?
  discordUrl          String?
  
  // Legal
  termsUrl            String?
  privacyUrl          String?
  
  updatedAt           DateTime @updatedAt
}
```

### 5.2 Admin Sidebar Layout

**Create** `apps/web/src/app/[locale]/(admin)/layout.tsx`:

```tsx
import { auth } from "@seq/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session?.user?.isAdmin) {
    redirect(`/${locale}/storyboard`);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

### 5.3 Admin Sidebar Component

**Create** `apps/web/src/components/admin/admin-sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@seq/ui";
import {
  LayoutDashboard,
  Users,
  Quote,
  Palette,
  Settings,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/quotes", icon: Quote, label: "Quotes" },
  { href: "/admin/branding", icon: Palette, label: "Branding" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-4 border-b">
        <Link href="/storyboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Back to App
        </Link>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

### 5.4 Branding Page

**Create** `apps/web/src/app/[locale]/(admin)/admin/branding/page.tsx`:

```tsx
import { db } from "@seq/database";
import { BrandingForm } from "@/components/admin/branding-form";

export default async function BrandingPage() {
  const settings = await db.systemSettings.findUnique({
    where: { id: "system" },
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Branding & White-Label</h1>
      <BrandingForm settings={settings} />
    </div>
  );
}
```

### 5.5 Branding Form

Features:
- App name, tagline, description
- Logo upload (light/dark/icon)
- Primary/accent color pickers
- Default palette/font selection
- Social links
- Legal URLs

---

## Phase 6: Testing (Vitest + Playwright)

### 6.1 Vitest Configuration

**Create** `apps/web/vitest.config.ts`:

```tsx
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@seq/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
```

**Create** `apps/web/vitest.setup.ts`:

```tsx
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({}),
  redirect: vi.fn(),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));
```

### 6.2 Example Unit Tests

**Create** `apps/web/src/components/login-form.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { signIn } from "next-auth/react";
import { LoginForm } from "./login-form";

vi.mock("next-auth/react");

describe("LoginForm", () => {
  it("renders Google sign-in button", () => {
    render(<LoginForm />);
    expect(screen.getByText(/Google ile devam et/i)).toBeInTheDocument();
  });

  it("calls signIn with google provider when button clicked", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByText(/Google ile devam et/i));
    expect(signIn).toHaveBeenCalledWith("google", expect.any(Object));
  });
});
```

**Create** `apps/web/src/app/actions.test.ts`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSequence } from "./actions";

// Mock auth
vi.mock("@seq/auth", () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock("@seq/database", () => ({
  db: {
    sequence: {
      create: vi.fn(),
    },
  },
}));

describe("Server Actions", () => {
  describe("createSequence", () => {
    it("returns unauthorized when not logged in", async () => {
      const { auth } = await import("@seq/auth");
      vi.mocked(auth).mockResolvedValue(null);

      const result = await createSequence({
        title: "Test",
        summary: "Test summary",
        // ...
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unauthorized");
    });

    it("validates input schema", async () => {
      const { auth } = await import("@seq/auth");
      vi.mocked(auth).mockResolvedValue({ user: { id: "1" } });

      const result = await createSequence({
        title: "", // Invalid: empty
        summary: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe("VALIDATION_ERROR");
    });
  });
});
```

### 6.3 Playwright E2E Configuration

**Create** `apps/web/playwright.config.ts`:

```tsx
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 6.4 Example E2E Tests

**Create** `apps/web/e2e/auth.spec.ts`:

```tsx
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/en/storyboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("shows Google sign-in button", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page.getByText(/Google/i)).toBeVisible();
  });

  test("shows terms and privacy links", async ({ page }) => {
    await page.goto("/en/login");
    await expect(page.getByText(/Kullanım Koşulları/i)).toBeVisible();
    await expect(page.getByText(/Gizlilik/i)).toBeVisible();
  });
});

test.describe("Storyboard Canvas", () => {
  test.use({ storageState: "e2e/.auth/user.json" }); // Authenticated state

  test("renders canvas with controls", async ({ page }) => {
    await page.goto("/en/storyboard");
    await expect(page.locator(".react-flow__controls")).toBeVisible();
    await expect(page.locator(".react-flow__minimap")).toBeVisible();
  });

  test("zoom controls work", async ({ page }) => {
    await page.goto("/en/storyboard");
    const zoomIn = page.locator('[aria-label="zoom in"]');
    await zoomIn.click();
    // Assert zoom level changed
  });
});
```

### 6.5 Test Scripts

**Add to** `apps/web/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

---

## Phase 7: Security Hardening

### 7.1 Security Headers

**Create** `apps/web/src/lib/security-headers.ts`:

```tsx
export const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.googleusercontent.com https://${process.env.R2_PUBLIC_DOMAIN};
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://accounts.google.com https://${process.env.R2_ENDPOINT};
  frame-src https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, " ").trim();
```

**Update** `next.config.ts`:

```tsx
import { securityHeaders, cspHeader } from "./src/lib/security-headers";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};
```

### 7.2 Rate Limiting

**Create** `apps/web/src/lib/rate-limit.ts`:

```tsx
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count current window
  const count = await redis.zcard(key);

  if (count >= limit) {
    const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true });
    const reset = oldestEntry[0]?.score
      ? Math.ceil(oldestEntry[0].score + windowSeconds - now)
      : windowSeconds;

    return { success: false, remaining: 0, reset };
  }

  // Add new entry
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, windowSeconds);

  return {
    success: true,
    remaining: limit - count - 1,
    reset: windowSeconds,
  };
}
```

### 7.3 Input Sanitization

**Create** `apps/web/src/lib/sanitize.ts`:

```tsx
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
    ALLOWED_ATTR: ["href"],
  });
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 255);
}

export function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

### 7.4 CSRF Protection

Server Actions have built-in CSRF protection via Origin header validation. Additional protection:

```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "sequences.app",
        "*.sequences.app",
      ],
    },
  },
};
```

---

## Phase 8: Performance Optimization

### 8.1 Image Optimization

```tsx
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};
```

### 8.2 React Flow Performance

```tsx
// Memoize node components
export const InstaxNode = memo(function InstaxNode(props: NodeProps) {
  // ...
});

// Use virtualization for large datasets
<ReactFlow
  nodes={nodes}
  onlyRenderVisibleElements
  nodesDraggable
  elementsSelectable
/>
```

### 8.3 Database Query Optimization

```tsx
// Use select to limit fields
const sequences = await db.sequence.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    eventDate: true,
    positionX: true,
    positionY: true,
    emotion: { select: { icon: true, key: true } },
  },
  orderBy: { storyboardOrder: "asc" },
});

// Use cursor-based pagination
const sequences = await db.sequence.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastId },
  where: { userId },
});
```

### 8.4 Bundle Size Optimization

```tsx
// Dynamic imports for heavy components
const StoryboardFlow = dynamic(
  () => import("@/components/storyboard/storyboard-flow"),
  { 
    loading: () => <CanvasSkeleton />,
    ssr: false, // Canvas doesn't need SSR
  }
);

// Tree-shake lucide icons
import { Heart } from "lucide-react/dist/esm/icons/heart";
```

---

## Phase 9: Type Safety & Edge Cases

### 9.1 Strict TypeScript Config

**Update** `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 9.2 Zod Schemas for All Inputs

```tsx
// Centralized schemas
// apps/web/src/lib/schemas.ts

import { z } from "zod";

export const sequenceSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .transform((s) => s.trim()),
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(2000, "Summary too long"),
  eventDate: z.coerce.date(),
  emotionId: z.number().int().positive(),
  emotionPolarity: z.number().int().min(-50).max(50),
  emotionIntensity: z.number().int().min(1).max(10),
  triggerId: z.number().int().positive(),
  thoughtContent: z.string().min(1).max(2000),
  thoughtPolarity: z.number().int().min(-50).max(50),
  thoughtIntensity: z.number().int().min(1).max(10),
  behaviorContent: z.string().min(1).max(2000),
  behaviorPolarity: z.number().int().min(-50).max(50),
  behaviorImpact: z.number().int().min(1).max(10),
  image: z.string().url().optional().nullable(),
  isPublic: z.boolean().default(false),
  isCoreMemory: z.boolean().default(false),
});

export const personSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  notes: z.string().max(2000).optional(),
  image: z.string().url().optional().nullable(),
  birthday: z.coerce.date().optional().nullable(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export const emailSchema = z.string().email().toLowerCase();

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores");
```

### 9.3 Edge Case Handling

```tsx
// Null checks
function getUserDisplayName(user: User | null): string {
  return user?.name ?? user?.email?.split("@")[0] ?? "Anonymous";
}

// Array safety
function getFirstSequence(sequences: Sequence[]): Sequence | undefined {
  return sequences.at(0); // Better than sequences[0]
}

// Date handling
function formatDate(date: Date | string | null): string {
  if (!date) return "Unknown";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString();
}

// Error boundaries
export function SequenceCard({ sequence }: { sequence: Sequence }) {
  // Guard against missing relations
  if (!sequence.emotion) {
    return <ErrorCard message="Missing emotion data" />;
  }
  // ...
}
```

### 9.4 Error Handling Patterns

```tsx
// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

// Action wrapper with error handling
async function safeAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message, code: error.code };
    }
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

---

## Phase 10: Scalability

### 10.1 Database Indexing

Already in schema - ensure these indexes exist:

```prisma
model Sequence {
  // ...
  @@index([userId])
  @@index([eventDate])
  @@index([isPublic])
  @@index([storyboardOrder])
  @@index([memoryId])
}

model Person {
  // ...
  @@index([userId])
  @@index([appUserId])
  @@index([parentId])
}
```

### 10.2 Connection Pooling

```tsx
// packages/database/src/index.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

### 10.3 Caching Strategy

```tsx
// Redis caching for frequently accessed data
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getCachedSystemSettings() {
  const cached = await redis.get<SystemSettings>("system-settings");
  if (cached) return cached;

  const settings = await db.systemSettings.findUnique({
    where: { id: "system" },
  });

  if (settings) {
    await redis.set("system-settings", settings, { ex: 3600 }); // 1 hour
  }

  return settings;
}

// Invalidate on update
export async function updateSystemSettings(data: Partial<SystemSettings>) {
  const settings = await db.systemSettings.update({
    where: { id: "system" },
    data,
  });
  await redis.del("system-settings");
  return settings;
}
```

### 10.4 Background Jobs (Future)

For future scalability, consider:

- **Trigger.dev** or **Inngest** for background jobs
- Email sending, image processing, analytics aggregation
- Webhook processing

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Storage (Cloudflare R2)
R2_ENDPOINT="https://xxx.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="sequences-media"
R2_PUBLIC_URL="https://media.sequences.app"

# Email (Resend)
RESEND_API_KEY="re_..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."

# Feature Flags
REQUIRE_EMAIL_VERIFICATION="false"

# App
NEXT_PUBLIC_APP_URL="https://sequences.app"
```

---

## File Structure Summary

```
apps/web/src/
├── app/
│   ├── actions.ts                    # All server actions
│   ├── [locale]/
│   │   ├── (public)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (protected)/
│   │   │   ├── storyboard/page.tsx
│   │   │   ├── lifetree/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   ├── create/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── quotes/page.tsx
│   │   │   │   ├── branding/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── verify-email/page.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── globals.css
├── components/
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── dashboard.tsx
│   │   ├── users-table.tsx
│   │   ├── quotes-manager.tsx
│   │   └── branding-form.tsx
│   ├── storyboard/
│   │   ├── storyboard-flow.tsx
│   │   ├── nodes/
│   │   │   └── instax-node.tsx
│   │   └── edges/
│   │       └── memory-edge.tsx
│   ├── lifetree/
│   │   ├── lifetree-flow.tsx
│   │   ├── nodes/
│   │   │   └── person-node.tsx
│   │   └── edges/
│   │       └── relation-edge.tsx
│   ├── login-form.tsx
│   ├── onboarding/
│   └── ...
├── lib/
│   ├── storage.ts                    # R2 upload utilities
│   ├── email.ts                      # Resend email
│   ├── rate-limit.ts                 # Rate limiting
│   ├── schemas.ts                    # Zod schemas
│   ├── security-headers.ts           # CSP & headers
│   └── utils.ts
├── e2e/                              # Playwright tests
│   ├── auth.spec.ts
│   ├── storyboard.spec.ts
│   └── admin.spec.ts
├── vitest.config.ts
├── vitest.setup.ts
└── playwright.config.ts
```

---

## Developer Feedback

### Güçlü Yanlar (Strengths)

1. **Solid Foundation**: Tailwind v4 + shadcn/ui + Prisma stack is excellent for rapid development
2. **Well-Designed Schema**: The Prisma schema is comprehensive and well-indexed
3. **Palette System**: 8 color palettes with CSS variables is a smart approach for theming
4. **i18n Ready**: Multi-language support from day one is good practice
5. **Monorepo Structure**: pnpm workspace with shared packages is scalable

### İyileştirme Önerileri (Suggestions)

1. **Canvas Performance**: For large storyboards (100+ nodes), consider virtualization or clustering
2. **Offline Support**: Future consideration for PWA with service workers
3. **Real-time Updates**: Consider WebSocket or Supabase Realtime for messages feature
4. **Analytics**: Add privacy-friendly analytics (Plausible/Umami) for usage insights
5. **Error Tracking**: Integrate Sentry for production error monitoring
6. **CI/CD**: Add GitHub Actions for automated testing and deployment

### Dikkat Edilmesi Gerekenler (Cautions)

1. **Photo Storage Costs**: Monitor R2 usage; implement cleanup for orphaned files
2. **Database Scaling**: PostgreSQL single instance is fine to start, but plan for read replicas
3. **Rate Limiting Costs**: Upstash has usage limits; consider self-hosted Redis for scale
4. **Email Deliverability**: Warm up Resend domain, set up SPF/DKIM/DMARC

### Önerilen Ek Özellikler (Future Features)

1. **Export**: Allow users to export their data (GDPR compliance)
2. **Import**: Import from other journaling apps
3. **Sharing**: Share individual sequences or memories publicly
4. **Collaboration**: Shared storyboards between users
5. **AI Insights**: CBT-based insights from emotion patterns
6. **Mobile App**: React Native / Expo version using same packages

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Setup database
pnpm --filter=@seq/database db:push
pnpm --filter=@seq/database db:seed

# Run development
pnpm dev

# Run tests
pnpm --filter=@seq/web test
pnpm --filter=@seq/web test:e2e

# Build for production
pnpm build

# Type check
pnpm typecheck
```

---

**Plan Status**: Ready for Implementation

**Estimated Effort**: 
- Phase 1-2: 2-3 days (cleanup + canvas)
- Phase 3-4: 1-2 days (storage + email)
- Phase 5: 2-3 days (admin panel)
- Phase 6-7: 2-3 days (testing + security)
- Phase 8-10: 1-2 days (optimization)

**Total**: ~10-15 days for full implementation
