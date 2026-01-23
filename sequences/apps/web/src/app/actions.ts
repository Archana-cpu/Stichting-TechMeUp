'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@seq/auth';
import { db } from '@seq/database';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { sanitizeHtml, sanitizeText, normalizeEmail, sanitizeUsername } from '@/lib/sanitize';
import { createUploadUrl, type UploadUrlResult } from '@/lib/storage';
import { sendVerificationEmail, generateVerificationCode } from '@/lib/email';

// ============================================================================
// TYPES
// ============================================================================

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; code?: string };

// ============================================================================
// HELPERS
// ============================================================================

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }
  return session.user;
}

async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

// ============================================================================
// SCHEMAS
// ============================================================================

// Sequence Schemas
const createSequenceSchema = z.object({
  eventDate: z.string().transform((s) => new Date(s)),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  image: z.string().url().optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
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
  peopleIds: z.array(z.string()).optional(),
});

const updateSequenceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(2000).optional(),
  eventDate: z.string().transform((s) => new Date(s)).optional(),
  image: z.string().url().optional().or(z.literal('')),
  emotionId: z.number().int().positive().optional(),
  emotionPolarity: z.number().int().min(-50).max(50).optional(),
  emotionIntensity: z.number().int().min(1).max(10).optional(),
  triggerId: z.number().int().positive().optional(),
  thoughtContent: z.string().min(1).max(2000).optional(),
  thoughtPolarity: z.number().int().min(-50).max(50).optional(),
  thoughtIntensity: z.number().int().min(1).max(10).optional(),
  behaviorContent: z.string().min(1).max(2000).optional(),
  behaviorPolarity: z.number().int().min(-50).max(50).optional(),
  behaviorImpact: z.number().int().min(1).max(10).optional(),
  isPublic: z.boolean().optional(),
  notes: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })).optional(),
  peopleIds: z.array(z.string()).optional(),
});

// Person Schemas
const createPersonSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.enum(['family', 'friend', 'colleague', 'acquaintance', 'partner', 'other']),
  notes: z.string().max(1000).optional(),
  image: z.string().url().optional(),
});

const updatePersonSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  relationship: z.enum(['family', 'friend', 'colleague', 'acquaintance', 'partner', 'other']).optional(),
  notes: z.string().max(1000).optional(),
  image: z.string().url().optional(),
});

// Settings Schemas
const updateUserSettingsSchema = z.object({
  theme: z.string().optional(),
  locale: z.enum(['en', 'tr', 'nl']).optional(),
  fontPairing: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showInPeopleSearch: z.boolean().optional(),
});

const updateAdminSettingsSchema = z.object({
  appName: z.string().min(1).max(50).optional(),
  appDescription: z.string().max(500).optional(),
  logoLight: z.string().url().optional().nullable(),
  logoDark: z.string().url().optional().nullable(),
  faviconLight: z.string().url().optional().nullable(),
  faviconDark: z.string().url().optional().nullable(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
  defaultTheme: z.string().optional(),
  defaultLocale: z.enum(['en', 'tr', 'nl']).optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  inviteOnlyMode: z.boolean().optional(),
  quotesEnabled: z.boolean().optional(),
  splashQuotes: z.boolean().optional(),
  dailyQuoteNotif: z.boolean().optional(),
  maxSequencesPerUser: z.number().int().min(0).optional(),
  maxPeoplePerUser: z.number().int().min(0).optional(),
  maxMemoriesPerUser: z.number().int().min(0).optional(),
});

// Profile Schema
const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  birthday: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  onboardingComplete: z.boolean().optional(),
});

// Memory Schema
const createMemorySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
  startDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  endDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
});

// Message Schema
const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(2000),
});

// Invitation Schema
const sendInvitationsSchema = z.object({
  emails: z.array(z.string().email()),
});

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>;
export type UpdateSequenceInput = z.infer<typeof updateSequenceSchema>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdateAdminSettingsInput = z.infer<typeof updateAdminSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SendInvitationsInput = z.infer<typeof sendInvitationsSchema>;

// ============================================================================
// SEQUENCE ACTIONS
// ============================================================================

export async function createSequence(
  input: CreateSequenceInput
): Promise<ActionResult<{ id: string }>> {
  let user;
  try {
    user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `sequence:create:${user.id}`,
      RATE_LIMITS['sequence:create']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = createSequenceSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    const data = result.data;
    const { peopleIds, image, ...sequenceData } = data;

    // Input sanitization
    const sanitizedData = {
      ...sequenceData,
      title: sanitizeText(sequenceData.title),
      summary: sanitizeHtml(sequenceData.summary),
      thoughtContent: sanitizeHtml(sequenceData.thoughtContent),
      behaviorContent: sanitizeHtml(sequenceData.behaviorContent),
    };

    const maxOrder = await db.sequence.aggregate({
      where: { userId: user.id },
      _max: { storyboardOrder: true },
    });

    const sequence = await db.sequence.create({
      data: {
        ...sanitizedData,
        image: image || null,
        userId: user.id,
        storyboardOrder: (maxOrder._max.storyboardOrder || 0) + 1,
        people: peopleIds?.length
          ? {
              create: peopleIds.map((personId) => ({ personId })),
            }
          : undefined,
      },
    });

    revalidatePath('/[locale]/storyboard', 'page');
    return { success: true, data: { id: sequence.id } };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('createSequence error:', {
      userId: user?.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: 'Failed to create sequence' };
  }
}

export async function updateSequence(
  id: string,
  input: UpdateSequenceInput
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `sequence:update:${user.id}`,
      RATE_LIMITS['sequence:update']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const existing = await db.sequence.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }

    const result = updateSequenceSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    const { notes, peopleIds, ...data } = result.data;

    // Sanitize text fields if present
    const sanitizedData = {
      ...data,
      ...(data.title && { title: sanitizeText(data.title) }),
      ...(data.summary && { summary: sanitizeHtml(data.summary) }),
      ...(data.thoughtContent && { thoughtContent: sanitizeHtml(data.thoughtContent) }),
      ...(data.behaviorContent && { behaviorContent: sanitizeHtml(data.behaviorContent) }),
    };

    await db.$transaction(async (tx) => {
      await tx.sequence.update({
        where: { id },
        data: sanitizedData,
      });

      if (notes) {
        await tx.note.deleteMany({ where: { sequenceId: id } });
        
        for (const note of notes) {
          await tx.note.create({
            data: {
              sequenceId: id,
              content: sanitizeHtml(note.content),
            },
          });
        }
      }

      if (peopleIds) {
        await tx.sequencePerson.deleteMany({ where: { sequenceId: id } });
        
        for (const personId of peopleIds) {
          await tx.sequencePerson.create({
            data: {
              sequenceId: id,
              personId,
            },
          });
        }
      }
    });

    revalidatePath('/[locale]/storyboard', 'page');
    revalidatePath(`/[locale]/sequence/${id}`, 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update sequence:', error);
    return { success: false, error: 'Failed to update sequence' };
  }
}

export async function deleteSequence(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `sequence:delete:${user.id}`,
      RATE_LIMITS['sequence:delete']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const existing = await db.sequence.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }

    await db.sequence.delete({ where: { id } });
    revalidatePath('/[locale]/storyboard', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to delete sequence:', error);
    return { success: false, error: 'Failed to delete sequence' };
  }
}

export async function reorderSequences(
  sequences: { id: string; order: number }[]
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `sequence:reorder:${user.id}`,
      RATE_LIMITS['sequence:update'] // Use update limit since it's similar
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    await db.$transaction(
      sequences.map(({ id, order }) =>
        db.sequence.updateMany({
          where: { id, userId: user.id },
          data: { storyboardOrder: order },
        })
      )
    );

    revalidatePath('/[locale]/storyboard', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to reorder sequences:', error);
    return { success: false, error: 'Failed to reorder sequences' };
  }
}

export async function getSequences() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return db.sequence.findMany({
    where: { userId: session.user.id },
    select: {
      // Only select needed fields
      id: true,
      title: true,
      summary: true,
      eventDate: true,
      image: true,
      isPublic: true,
      isCoreMemory: true,
      storyboardOrder: true,
      positionX: true,
      positionY: true,
      emotionPolarity: true,
      emotionIntensity: true,
      thoughtPolarity: true,
      thoughtIntensity: true,
      behaviorPolarity: true,
      behaviorImpact: true,
      createdAt: true,
      // Relations - select only needed fields
      emotion: {
        select: {
          id: true,
          key: true,
          icon: true,
          colorHsl: true,
        },
      },
      trigger: {
        select: {
          id: true,
          key: true,
          icon: true,
        },
      },
      people: {
        select: {
          person: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          reactions: true,
          comments: true,
          people: true,
        },
      },
    },
    orderBy: { storyboardOrder: 'asc' },
  });
}

// Paginated version for large datasets
export async function getSequencesPaginated(params: {
  cursor?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) {
    return { sequences: [], nextCursor: null };
  }

  const limit = params.limit || 20;

  const sequences = await db.sequence.findMany({
    take: limit + 1, // Extra 1 for hasMore check
    ...(params.cursor && {
      skip: 1,
      cursor: { id: params.cursor },
    }),
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      eventDate: true,
      image: true,
      storyboardOrder: true,
      positionX: true,
      positionY: true,
      emotion: {
        select: {
          key: true,
          icon: true,
          colorHsl: true,
        },
      },
    },
    orderBy: { storyboardOrder: 'asc' },
  });

  const hasMore = sequences.length > limit;
  const items = hasMore ? sequences.slice(0, -1) : sequences;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    sequences: items,
    nextCursor,
  };
}

export async function getSequenceById(id: string) {
  return db.sequence.findUnique({
    where: { id },
    include: {
      emotion: true,
      trigger: true,
      notes: true,
      people: { include: { person: true } },
      user: { select: { id: true, username: true, name: true, image: true } },
    },
  });
}

const updateSequencePositionSchema = z.object({
  id: z.string(),
  positionX: z.number(),
  positionY: z.number(),
});

export type UpdateSequencePositionInput = z.infer<typeof updateSequencePositionSchema>;

export async function updateSequencePosition(
  input: UpdateSequencePositionInput
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting - use person:update limit since position updates are frequent
    const rateLimitResult = await rateLimit(
      `sequence:position:${user.id}`,
      RATE_LIMITS['person:update'] // 60/dk - frequent updates during drag
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = updateSequencePositionSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' };
    }

    const sequence = await db.sequence.findUnique({
      where: { id: result.data.id },
      select: { userId: true },
    });

    if (!sequence || sequence.userId !== user.id) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    await db.sequence.update({
      where: { id: result.data.id },
      data: {
        positionX: result.data.positionX,
        positionY: result.data.positionY,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update sequence position:', error);
    return { success: false, error: 'Failed to update position' };
  }
}

const updateSequencePositionsBatchSchema = z.array(
  z.object({
    id: z.string(),
    positionX: z.number(),
    positionY: z.number(),
  })
);

export async function updateSequencePositionsBatch(
  positions: z.infer<typeof updateSequencePositionsBatchSchema>
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting - batch operations should be more restrictive
    const rateLimitResult = await rateLimit(
      `sequence:position:batch:${user.id}`,
      RATE_LIMITS['sequence:update'] // 30/dk - batch updates
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = updateSequencePositionsBatchSchema.safeParse(positions);
    if (!result.success) {
      return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' };
    }

    // Verify all sequences belong to user
    const sequenceIds = result.data.map((p) => p.id);
    const userSequences = await db.sequence.findMany({
      where: { id: { in: sequenceIds }, userId: user.id },
      select: { id: true },
    });

    if (userSequences.length !== sequenceIds.length) {
      return { success: false, error: 'Some sequences not found', code: 'NOT_FOUND' };
    }

    await db.$transaction(
      result.data.map((pos) =>
        db.sequence.update({
          where: { id: pos.id },
          data: {
            positionX: pos.positionX,
            positionY: pos.positionY,
          },
        })
      )
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update sequence positions:', error);
    return { success: false, error: 'Failed to update positions' };
  }
}

// ============================================================================
// PEOPLE ACTIONS
// ============================================================================

export async function createPerson(
  input: CreatePersonInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `person:create:${user.id}`,
      RATE_LIMITS['person:create']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = createPersonSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    // Sanitize input
    const sanitizedData = {
      ...result.data,
      name: sanitizeText(result.data.name),
      notes: result.data.notes ? sanitizeHtml(result.data.notes) : undefined,
    };

    const person = await db.person.create({
      data: {
        ...sanitizedData,
        userId: user.id,
      },
    });

    revalidatePath('/[locale]/people', 'page');
    return { success: true, data: { id: person.id } };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to create person:', error);
    return { success: false, error: 'Failed to create person' };
  }
}

export async function updatePerson(
  id: string,
  input: UpdatePersonInput
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `person:update:${user.id}`,
      RATE_LIMITS['person:update']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const existing = await db.person.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    const result = updatePersonSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    // Sanitize input
    const sanitizedData = {
      ...result.data,
      ...(result.data.name && { name: sanitizeText(result.data.name) }),
      ...(result.data.notes && { notes: sanitizeHtml(result.data.notes) }),
    };

    await db.person.update({
      where: { id },
      data: sanitizedData,
    });

    revalidatePath('/[locale]/people', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update person:', error);
    return { success: false, error: 'Failed to update person' };
  }
}

export async function deletePerson(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `person:delete:${user.id}`,
      { uniqueTokenPerInterval: 10, interval: 60 } // 10 per minute
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const existing = await db.person.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    await db.person.delete({ where: { id } });
    revalidatePath('/[locale]/people', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to delete person:', error);
    return { success: false, error: 'Failed to delete person' };
  }
}

export async function getPeople() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return db.person.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      relationship: true,
      notes: true,
      image: true,
      birthday: true,
      positionX: true,
      positionY: true,
      _count: { select: { sequences: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPersonById(id: string) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return db.person.findUnique({
    where: { id, userId: session.user.id },
    include: {
      sequences: {
        include: {
          sequence: {
            select: { id: true, title: true, eventDate: true, image: true },
          },
        },
      },
    },
  });
}

// ============================================================================
// USER SETTINGS ACTIONS
// ============================================================================

export async function updateUserSettings(
  input: UpdateUserSettingsInput
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `settings:update:${user.id}`,
      { uniqueTokenPerInterval: 30, interval: 60 } // 30 per minute
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = updateUserSettingsSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    const { theme, locale, ...settingsData } = result.data;

    if (theme || locale) {
      await db.user.update({
        where: { id: user.id },
        data: { ...(theme && { theme }), ...(locale && { locale }) },
      });
    }

    if (Object.keys(settingsData).length > 0) {
      await db.userSettings.upsert({
        where: { userId: user.id },
        update: settingsData,
        create: { userId: user.id, ...settingsData },
      });
    }

    revalidatePath('/[locale]/settings', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update user settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function getUserSettings() {
  const session = await auth();
  if (!session?.user) {
    return null;
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

  return { user, settings };
}

// ============================================================================
// ADMIN SETTINGS ACTIONS
// ============================================================================

export async function updateAdminSettings(
  input: UpdateAdminSettingsInput
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    // Rate limiting for admin actions
    const rateLimitResult = await rateLimit(
      `admin:settings:${user.id}`,
      RATE_LIMITS['admin:settings']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = updateAdminSettingsSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    await db.systemSettings.upsert({
      where: { id: 'system' },
      update: result.data,
      create: { id: 'system', ...result.data },
    });

    revalidatePath('/[locale]/admin', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update admin settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

export async function getAdminSettings() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return null;
  }

  return db.systemSettings.findUnique({
    where: { id: 'system' },
  });
}

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `profile:update:${user.id}`,
      { uniqueTokenPerInterval: 30, interval: 60 } // 30 per minute
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = updateProfileSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    const { username, ...data } = result.data;

    // Sanitize and check username availability if updating
    let sanitizedUsername: string | undefined;
    if (username) {
      const sanitized = sanitizeUsername(username);
      if (!sanitized) {
        return { success: false, error: 'Invalid username format', code: 'VALIDATION_ERROR' };
      }
      sanitizedUsername = sanitized;

      const existing = await db.user.findFirst({
        where: {
          username: sanitizedUsername,
          NOT: { id: user.id },
        },
      });

      if (existing) {
        return { success: false, error: 'Username already taken', code: 'USERNAME_TAKEN' };
      }
    }

    // Sanitize bio field if provided
    const sanitizedData = {
      ...data,
      ...(data.bio && { bio: sanitizeHtml(data.bio) }),
      ...(data.name && { name: sanitizeText(data.name) }),
    };

    await db.user.update({
      where: { id: user.id },
      data: {
        ...sanitizedData,
        ...(sanitizedUsername && { username: sanitizedUsername }),
      },
    });

    revalidatePath('/[locale]/profile', 'page');
    revalidatePath('/[locale]/settings', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean }> {
  if (username.length < 3) {
    return { available: false };
  }

  const session = await auth();
  
  const existing = await db.user.findFirst({
    where: {
      username,
      ...(session?.user?.id && { NOT: { id: session.user.id } }),
    },
  });

  return { available: !existing };
}

// ============================================================================
// MEMORY ACTIONS
// ============================================================================

export async function createMemory(
  input: CreateMemoryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `memory:create:${user.id}`,
      { uniqueTokenPerInterval: 10, interval: 60 } // 10 per minute
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = createMemorySchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    // Sanitize description field if provided
    const sanitizedData = {
      ...result.data,
      title: sanitizeText(result.data.title),
      ...(result.data.description && { description: sanitizeHtml(result.data.description) }),
    };

    const memory = await db.memory.create({
      data: {
        ...sanitizedData,
        userId: user.id,
      },
    });

    revalidatePath('/[locale]/memories', 'page');
    return { success: true, data: { id: memory.id } };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to create memory:', error);
    return { success: false, error: 'Failed to create memory' };
  }
}

export async function deleteMemory(id: string): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `memory:delete:${user.id}`,
      { uniqueTokenPerInterval: 5, interval: 60 } // 5 per minute
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const existing = await db.memory.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Not found', code: 'NOT_FOUND' };
    }

    await db.memory.delete({ where: { id } });
    revalidatePath('/[locale]/memories', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to delete memory:', error);
    return { success: false, error: 'Failed to delete memory' };
  }
}

export async function getMemories() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return db.memory.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { sequences: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================================================
// MESSAGE ACTIONS
// ============================================================================

export async function sendMessage(
  input: SendMessageInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `message:send:${user.id}`,
      RATE_LIMITS['message:send']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = sendMessageSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' };
    }

    // Sanitize message content
    const sanitizedContent = sanitizeHtml(result.data.content);

    const message = await db.message.create({
      data: {
        senderId: user.id,
        receiverId: result.data.receiverId,
        content: sanitizedContent,
      },
    });

    revalidatePath('/[locale]/messages', 'page');
    return { success: true, data: { id: message.id } };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to send message:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getConversations() {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, username: true, name: true, image: true } },
      receiver: { select: { id: true, username: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by conversation
  const conversationMap = new Map<string, {
    user: { id: string; username: string | null; name: string | null; image: string | null };
    messages: typeof messages;
    unreadCount: number;
  }>();

  messages.forEach((msg) => {
    const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender;
    const existing = conversationMap.get(otherUser.id);
    
    if (existing) {
      existing.messages.push(msg);
      if (!msg.read && msg.receiverId === session.user.id) {
        existing.unreadCount++;
      }
    } else {
      conversationMap.set(otherUser.id, {
        user: otherUser,
        messages: [msg],
        unreadCount: !msg.read && msg.receiverId === session.user.id ? 1 : 0,
      });
    }
  });

  return Array.from(conversationMap.values());
}

// ============================================================================
// INVITATION ACTIONS
// ============================================================================

export async function sendInvitations(
  input: SendInvitationsInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await requireAuth();

    // Rate limiting - prevent spam invitations
    const rateLimitResult = await rateLimit(
      `invitation:send:${user.id}`,
      { uniqueTokenPerInterval: 10, interval: 3600 } // 10 per hour
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = sendInvitationsSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' };
    }

    const { emails } = result.data;

    // Normalize emails (lowercase, trim)
    const normalizedEmails = emails.map((email) => normalizeEmail(email));

    const invitations = await db.invitation.createMany({
      data: normalizedEmails.map((email) => ({
        email,
        inviterId: user.id,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })),
      skipDuplicates: true,
    });

    return { success: true, data: { count: invitations.count } };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to send invitations:', error);
    return { success: false, error: 'Failed to send invitations' };
  }
}

// ============================================================================
// FILE UPLOAD ACTIONS
// ============================================================================

const getUploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  folder: z.enum(['images', 'avatars', 'covers', 'branding']).default('images'),
});

export type GetUploadUrlInput = z.infer<typeof getUploadUrlSchema>;

export async function getUploadUrl(
  input: GetUploadUrlInput
): Promise<ActionResult<UploadUrlResult>> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `upload:image:${user.id}`,
      RATE_LIMITS['upload:image']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = getUploadUrlSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: 'Invalid input', code: 'VALIDATION_ERROR' };
    }

    const uploadResult = await createUploadUrl(
      user.id,
      result.data.filename,
      result.data.contentType,
      result.data.size,
      result.data.folder
    );

    if (!uploadResult.success) {
      return { 
        success: false, 
        error: uploadResult.error.message, 
        code: uploadResult.error.code 
      };
    }

    return { success: true, data: uploadResult.data };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to get upload URL:', error);
    return { success: false, error: 'Failed to get upload URL' };
  }
}

// ============================================================================
// EMAIL VERIFICATION ACTIONS
// ============================================================================

export async function sendVerificationCode(): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    // Rate limiting
    const rateLimitResult = await rateLimit(
      `auth:verify-email:${user.id}`,
      RATE_LIMITS['auth:verify-email']
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMITED' };
    }

    // Get user email
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { email: true, locale: true },
    });

    if (!userData?.email) {
      return { success: false, error: 'No email found', code: 'NOT_FOUND' };
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing verification codes for this email
    await db.emailVerification.deleteMany({
      where: { email: userData.email },
    });

    // Create new verification record
    await db.emailVerification.create({
      data: {
        email: userData.email,
        code,
        expiresAt,
      },
    });

    // Send email
    const emailResult = await sendVerificationEmail(
      userData.email,
      code,
      (userData.locale as 'en' | 'tr' | 'nl') || 'en'
    );

    if (!emailResult.success) {
      return { success: false, error: 'Failed to send verification email' };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to send verification code:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

const verifyEmailCodeSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
});

export async function verifyEmailCode(
  input: z.infer<typeof verifyEmailCodeSchema>
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const result = verifyEmailCodeSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: 'Invalid code format', code: 'VALIDATION_ERROR' };
    }

    // Get user email
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });

    if (!userData?.email) {
      return { success: false, error: 'No email found', code: 'NOT_FOUND' };
    }

    // Find verification record
    const verification = await db.emailVerification.findFirst({
      where: {
        email: userData.email,
        code: result.data.code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      // Increment attempts for this email
      await db.emailVerification.updateMany({
        where: { email: userData.email },
        data: { attempts: { increment: 1 } },
      });

      // Check if max attempts exceeded
      const existingVerification = await db.emailVerification.findFirst({
        where: { email: userData.email },
      });

      if (existingVerification && existingVerification.attempts >= 5) {
        // Delete the verification record to force requesting a new code
        await db.emailVerification.deleteMany({
          where: { email: userData.email },
        });
        return { 
          success: false, 
          error: 'Too many attempts. Please request a new code.', 
          code: 'MAX_ATTEMPTS' 
        };
      }

      return { success: false, error: 'Invalid or expired code', code: 'INVALID_CODE' };
    }

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the verification record
    await db.emailVerification.deleteMany({
      where: { email: userData.email },
    });

    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to verify email code:', error);
    return { success: false, error: 'Failed to verify email' };
  }
}

// ============================================================================
// QUOTE ACTIONS (Admin)
// ============================================================================

const createQuoteSchema = z.object({
  textEn: z.string().min(1).max(1000),
  textTr: z.string().min(1).max(1000),
  textNl: z.string().min(1).max(1000),
  author: z.string().min(1).max(200),
  source: z.string().max(500).optional(),
  category: z.enum(['psychology', 'philosophy', 'sociology']),
  isActive: z.boolean().default(true),
  emotionKeys: z.array(z.string()).default([]),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export async function createQuote(
  input: Partial<CreateQuoteInput>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAdmin();

    // Rate limiting for admin actions
    const rateLimitResult = await rateLimit(
      `admin:quotes:create:${user.id}`,
      RATE_LIMITS['admin:settings'] // Use admin settings limit
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    const result = createQuoteSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.flatten().formErrors.join(', '), code: 'VALIDATION_ERROR' };
    }

    // Sanitize text fields
    const sanitizedData = {
      ...result.data,
      textEn: sanitizeText(result.data.textEn),
      textTr: sanitizeText(result.data.textTr),
      textNl: sanitizeText(result.data.textNl),
      author: sanitizeText(result.data.author),
      ...(result.data.source && { source: sanitizeText(result.data.source) }),
    };

    const quote = await db.quote.create({
      data: sanitizedData,
    });

    revalidatePath('/[locale]/admin/quotes', 'page');
    return { success: true, data: { id: quote.id } };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to create quote:', error);
    return { success: false, error: 'Failed to create quote' };
  }
}

export async function updateQuote(
  id: string,
  input: Partial<CreateQuoteInput>
): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    // Rate limiting for admin actions
    const rateLimitResult = await rateLimit(
      `admin:quotes:update:${user.id}`,
      RATE_LIMITS['admin:settings'] // Use admin settings limit
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    // Sanitize text fields if provided
    const sanitizedData = {
      ...input,
      ...(input.textEn && { textEn: sanitizeText(input.textEn) }),
      ...(input.textTr && { textTr: sanitizeText(input.textTr) }),
      ...(input.textNl && { textNl: sanitizeText(input.textNl) }),
      ...(input.author && { author: sanitizeText(input.author) }),
      ...(input.source && { source: sanitizeText(input.source) }),
    };

    await db.quote.update({
      where: { id },
      data: sanitizedData,
    });

    revalidatePath('/[locale]/admin/quotes', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to update quote:', error);
    return { success: false, error: 'Failed to update quote' };
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    const user = await requireAdmin();

    // Rate limiting for admin actions
    const rateLimitResult = await rateLimit(
      `admin:quotes:delete:${user.id}`,
      RATE_LIMITS['admin:settings'] // Use admin settings limit
    );
    if (!rateLimitResult.success) {
      return { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMITED' };
    }

    await db.quote.delete({ where: { id } });

    revalidatePath('/[locale]/admin/quotes', 'page');
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return { success: false, error: 'Forbidden', code: 'FORBIDDEN' };
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
    }
    console.error('Failed to delete quote:', error);
    return { success: false, error: 'Failed to delete quote' };
  }
}
