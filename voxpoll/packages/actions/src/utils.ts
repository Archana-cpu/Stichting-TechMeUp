/**
 * Action utilities
 */
import type { ApiResponse, ApiError } from "@voxpoll/shared";

/**
 * Create a success response
 */
export function success<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create an error response
 */
export function error(code: string, message: string, details?: Record<string, unknown>): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Action result type for server actions
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

/**
 * Wrap an async function to handle errors gracefully
 */
export async function safeAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return {
      success: false,
      error: {
        code: "ACTION_ERROR",
        message,
      },
    };
  }
}

/**
 * Paginate results
 */
export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: items.slice(start, end),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
