// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - TEST VALIDATORS
// Zod validation schemas for test endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const testCategorySchema = z.enum(['PERSONALITY', 'QUIZ'])

export const personalityTestTypeSchema = z.enum(['AXIS', 'CHARACTER', 'SPECTRUM'])

export const quizTypeSchema = z.enum(['KNOWLEDGE', 'TRIVIA', 'EDUCATIONAL', 'SKILL_ASSESSMENT'])

export const personalityQuestionTypeSchema = z.enum([
  'STATEMENT_AGREE_5',
  'STATEMENT_AGREE_7',
  'AGREE_DISAGREE',
  'FORCED_CHOICE',
])

export const quizQuestionTypeSchema = z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'])

export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])

export const testSortSchema = z.enum(['recent', 'popular', 'trending'])

// ─────────────────────────────────────────────────────────────────────────────
// Create Personality Test Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createPersonalityTestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  organizationId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional(),
  testType: personalityTestTypeSchema,
  settings: z.object({}).passthrough(),
})

export type CreatePersonalityTestInput = z.infer<typeof createPersonalityTestSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Create Quiz Test Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createQuizTestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  organizationId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional(),
  quizType: quizTypeSchema,
  timeLimitMinutes: z.number().int().min(1).max(180).optional(),
  attemptsAllowed: z.number().int().min(1).max(10).default(1),
  passingScore: z.number().min(0).max(100).optional(),
  showCorrectAnswers: z.boolean().default(true),
  showScoreImmediately: z.boolean().default(true),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  startsAt: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
  endsAt: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
})

export type CreateQuizTestInput = z.infer<typeof createQuizTestSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Test Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateTestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .nullable(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  coverImageUrl: z.string().url('Invalid image URL').optional().nullable(),
  categoryId: z.string().optional().nullable(),
})

export type UpdateTestInput = z.infer<typeof updateTestSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Add Personality Question Schema
// ─────────────────────────────────────────────────────────────────────────────

export const addPersonalityQuestionSchema = z.object({
  text: z
    .string()
    .min(1, 'Question text is required')
    .max(500, 'Question text must be at most 500 characters'),
  questionType: personalityQuestionTypeSchema,
  config: z.object({}).passthrough(),
  weight: z.number().min(0).max(10).default(1),
  imageUrl: z.string().url('Invalid image URL').optional(),
})

export type AddPersonalityQuestionInput = z.infer<typeof addPersonalityQuestionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Add Quiz Question Schema
// ─────────────────────────────────────────────────────────────────────────────

export const addQuizQuestionSchema = z.object({
  type: quizQuestionTypeSchema,
  text: z
    .string()
    .min(1, 'Question text is required')
    .max(1000, 'Question text must be at most 1000 characters'),
  explanation: z
    .string()
    .max(2000, 'Explanation must be at most 2000 characters')
    .optional(),
  options: z.array(z.object({
    text: z.string().min(1).max(500),
    value: z.string().optional(),
  })).min(2).max(6),
  correctAnswer: z.unknown(),
  points: z.number().min(0).max(100).default(1),
  negativePoints: z.number().min(0).max(100).default(0),
  timeLimitSeconds: z.number().int().min(5).max(600).optional(),
  difficulty: questionDifficultySchema.default('MEDIUM'),
  imageUrl: z.string().url('Invalid image URL').optional(),
})

export type AddQuizQuestionInput = z.infer<typeof addQuizQuestionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Submit Personality Result Schema
// ─────────────────────────────────────────────────────────────────────────────

export const submitPersonalityResultSchema = z.object({
  responses: z.record(z.string(), z.unknown()),
  timeSpentSeconds: z.number().int().min(0).optional(),
})

export type SubmitPersonalityResultInput = z.infer<typeof submitPersonalityResultSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Submit Quiz Attempt Schema
// ─────────────────────────────────────────────────────────────────────────────

export const submitQuizAttemptSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  timeSpentSeconds: z.number().int().min(0).optional(),
})

export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>

// ─────────────────────────────────────────────────────────────────────────────
// List Tests Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const listTestsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  sort: testSortSchema.optional().default('recent'),
  category: testCategorySchema.optional(),
  categoryId: z.string().optional(),
  search: z.string().max(100).optional(),
})

export type ListTestsInput = z.infer<typeof listTestsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Test ID Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const testIdParamSchema = z.object({
  id: z.string().min(1, 'Test ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Test Slug Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const testSlugParamSchema = z.object({
  slug: z.string().min(1, 'Test slug is required'),
})
