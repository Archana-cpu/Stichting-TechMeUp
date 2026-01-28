/**
 * Common validation schemas
 */
import { z } from "zod";

// UUID validation
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Date schemas
export const dateStringSchema = z.string().datetime({ message: "Invalid date format" });
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return data.from <= data.to;
    }
    return true;
  },
  { message: "From date must be before or equal to to date" }
);

// Sort schemas
export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");
export const sortBySchema = z.object({
  field: z.string(),
  order: sortOrderSchema,
});

// Search schema
export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  ...paginationSchema.shape,
});

// ID params schema (for route params)
export const idParamSchema = z.object({
  id: uuidSchema,
});

// Slug params schema
export const slugParamSchema = z.object({
  slug: z.string().min(1).max(100),
});

// Types
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type SortByInput = z.infer<typeof sortBySchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;
