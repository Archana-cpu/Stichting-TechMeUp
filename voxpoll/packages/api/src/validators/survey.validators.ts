// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - SURVEY VALIDATORS
// Zod validation schemas for survey endpoints
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const surveyTypeSchema = z.enum([
  'GENERAL',
  'FEEDBACK',
  'RESEARCH',
  'QUIZ',
  'ASSESSMENT',
])

export const questionTypeSchema = z.enum([
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'DATE',
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'DROPDOWN',
  'RATING',
  'SCALE',
  'MATRIX',
  'RANKING',
  'FILE_UPLOAD',
])

export const surveySortSchema = z.enum(['recent', 'popular', 'responses'])

// ─────────────────────────────────────────────────────────────────────────────
// Create Survey Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createSurveySchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  type: surveyTypeSchema.default('GENERAL'),
  categoryId: z.string().optional(),
  tags: z
    .array(z.string().min(1).max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
})

export type CreateSurveyInput = z.infer<typeof createSurveySchema>

// ─────────────────────────────────────────────────────────────────────────────
// Update Survey Schema
// ─────────────────────────────────────────────────────────────────────────────

export const updateSurveySchema = z.object({
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
  estimatedMinutes: z.number().int().min(1).max(120).optional(),
  targetResponseCount: z.number().int().min(1).max(100000).optional(),
  allowAnonymous: z.boolean().optional(),
  allowSaveProgress: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
})

export type UpdateSurveyInput = z.infer<typeof updateSurveySchema>

// ─────────────────────────────────────────────────────────────────────────────
// Create Section Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createSectionSchema = z.object({
  title: z
    .string()
    .max(200, 'Section title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Section description must be at most 1000 characters')
    .optional(),
})

export type CreateSectionInput = z.infer<typeof createSectionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Create Question Schema
// ─────────────────────────────────────────────────────────────────────────────

export const createQuestionSchema = z.object({
  type: questionTypeSchema,
  text: z
    .string()
    .min(1, 'Question text is required')
    .max(1000, 'Question text must be at most 1000 characters'),
  description: z
    .string()
    .max(500, 'Question description must be at most 500 characters')
    .optional(),
  isRequired: z.boolean().default(false),
  options: z
    .object({
      choices: z
        .array(
          z.object({
            text: z.string().min(1).max(500),
            value: z.string().optional(),
          })
        )
        .optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
      rows: z.array(z.string()).optional(),
      columns: z.array(z.string()).optional(),
      allowOther: z.boolean().optional(),
      placeholder: z.string().max(200).optional(),
    })
    .optional(),
  validation: z
    .object({
      minLength: z.number().int().min(0).optional(),
      maxLength: z.number().int().min(1).optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
      pattern: z.string().optional(),
      minSelections: z.number().int().min(1).optional(),
      maxSelections: z.number().int().min(1).optional(),
    })
    .optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Submit Response Schema
// ─────────────────────────────────────────────────────────────────────────────

export const submitResponseSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
})

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>

// ─────────────────────────────────────────────────────────────────────────────
// List Surveys Query Schema
// ─────────────────────────────────────────────────────────────────────────────

export const listSurveysSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  sort: surveySortSchema.optional().default('recent'),
  organization: z.string().optional(),
  category: z.string().optional(),
})

export type ListSurveysInput = z.infer<typeof listSurveysSchema>

// ─────────────────────────────────────────────────────────────────────────────
// Survey ID Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const surveyIdParamSchema = z.object({
  id: z.string().min(1, 'Survey ID is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Section ID Param Schema
// ─────────────────────────────────────────────────────────────────────────────

export const sectionIdParamSchema = z.object({
  id: z.string().min(1, 'Survey ID is required'),
  sectionId: z.string().min(1, 'Section ID is required'),
})
