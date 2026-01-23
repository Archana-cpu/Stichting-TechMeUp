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
  theme: z.string().optional(),
  locale: z.enum(['en', 'tr', 'nl']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showInPeopleSearch: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [user, settings] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, theme: true, locale: true },
    }),
    db.userSettings.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({ user, settings });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = updateSettingsSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { theme, locale, ...settingsData } = result.data;

  if (theme || locale) {
    await db.user.update({
      where: { id: session.user.id },
      data: { ...(theme && { theme }), ...(locale && { locale }) },
    });
  }

  if (Object.keys(settingsData).length > 0) {
    await db.userSettings.upsert({
      where: { userId: session.user.id },
      update: settingsData,
      create: { userId: session.user.id, ...settingsData },
    });
  }

  return NextResponse.json({ success: true });
}
