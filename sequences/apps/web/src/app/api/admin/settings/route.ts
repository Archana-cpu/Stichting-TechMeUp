/**
 * @deprecated This API route is deprecated in favor of server actions.
 * See: src/actions/settings.ts
 * Keeping for backwards compatibility with external clients.
 */
import { NextResponse } from 'next/server';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  appName: z.string().min(1).max(50).optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  defaultTheme: z.string().optional(),
  defaultLocale: z.enum(['en', 'tr', 'nl']).optional(),
});

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const result = updateSettingsSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const settings = await db.systemSettings.upsert({
    where: { id: 'system' },
    update: result.data,
    create: { id: 'system', ...result.data },
  });

  return NextResponse.json(settings);
}
