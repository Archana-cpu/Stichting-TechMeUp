/**
 * Poll validation schemas
 */
import { z } from "zod";
import { uuidSchema, paginationSchema, sortOrderSchema } from "./common.js";

// Poll status enum
export const pollStatusSchema = z.enum(["draft", "active", "closed", "archived"]);

// Poll visibility enum
export const pollVisibilitySchema = z.enum(["public", "private", "unlisted"]);

// Poll type enum
export const pollTypeSchema = z.enum(["single", "multiple", "ranked", "rating"]);

// Poll option schema
export const pollOptionSchema = z.object({
  id: uuidSchema.optional(),
  text: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be at most 500 characters")
    .trim(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
});

// Create poll schema
export const createPollSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  type: pollTypeSchema.default("single"),
  visibility: pollVisibilitySchema.default("public"),
  options: z
    .array(pollOptionSchema)
    .min(2, "Poll must have at least 2 options")
    .max(20, "Poll can have at most 20 options"),
  settings: z.object({
    allowComments: z.boolean().default(true),
    showResults: z.enum(["always", "after_vote", "after_close"]).default("after_vote"),
    requireAuth: z.boolean().default(false),
    multipleVotes: z.boolean().default(false),
    maxSelections: z.number().int().min(1).max(20).optional(),
    endDate: z.coerce.date().optional(),
    allowChangeVote: z.boolean().default(false),
  }).optional(),
  categoryId: uuidSchema.optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// Update poll schema
export const updatePollSchema = createPollSchema.partial().extend({
  status: pollStatusSchema.optional(),
});

// Vote schema
export const voteSchema = z.object({
  pollId: uuidSchema,
  optionIds: z
    .array(uuidSchema)
    .min(1, "At least one option must be selected"),
  ranking: z
    .array(z.object({
      optionId: uuidSchema,
      rank: z.number().int().min(1),
    }))
    .optional(),
  rating: z.number().int().min(1).max(10).optional(),
});

// Poll filter schema
export const pollFilterSchema = z.object({
  status: pollStatusSchema.optional(),
  visibility: pollVisibilitySchema.optional(),
  type: pollTypeSchema.optional(),
  categoryId: uuidSchema.optional(),
  authorId: uuidSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "votes", "comments"]).default("createdAt"),
  sortOrder: sortOrderSchema,
  ...paginationSchema.shape,
});

// Comment schema
export const createCommentSchema = z.object({
  pollId: uuidSchema,
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be at most 2000 characters")
    .trim(),
  parentId: uuidSchema.optional(),
});

// Update comment schema
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be at most 2000 characters")
    .trim(),
});

// Report poll schema
export const reportPollSchema = z.object({
  pollId: uuidSchema,
  reason: z.enum([
    "spam",
    "misleading",
    "hate_speech",
    "inappropriate",
    "copyright",
    "other",
  ]),
  description: z.string().max(1000).optional(),
});

// Types
export type PollStatus = z.infer<typeof pollStatusSchema>;
export type PollVisibility = z.infer<typeof pollVisibilitySchema>;
export type PollType = z.infer<typeof pollTypeSchema>;
export type PollOption = z.infer<typeof pollOptionSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type PollFilterInput = z.infer<typeof pollFilterSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ReportPollInput = z.infer<typeof reportPollSchema>;
