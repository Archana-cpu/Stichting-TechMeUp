/**
 * User validation schemas
 */
import { z } from "zod";
import { uuidSchema } from "./common.js";

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
  .toLowerCase();

// User profile update schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  username: usernameSchema.optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .optional(),
  website: z
    .string()
    .url("Invalid website URL")
    .max(200, "Website URL must be at most 200 characters")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showVotingHistory: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().max(50).optional(),
});

// User search schema
export const searchUsersSchema = z.object({
  q: z.string().min(1, "Search query is required").max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Follow user schema
export const followUserSchema = z.object({
  userId: uuidSchema,
});

// Block user schema
export const blockUserSchema = z.object({
  userId: uuidSchema,
  reason: z.string().max(500).optional(),
});

// Report user schema
export const reportUserSchema = z.object({
  userId: uuidSchema,
  reason: z.enum([
    "spam",
    "harassment",
    "hate_speech",
    "impersonation",
    "inappropriate_content",
    "other",
  ]),
  description: z.string().max(1000).optional(),
});

// Types
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type FollowUserInput = z.infer<typeof followUserSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type ReportUserInput = z.infer<typeof reportUserSchema>;
