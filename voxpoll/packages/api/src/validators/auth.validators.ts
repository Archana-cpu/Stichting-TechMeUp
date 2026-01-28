// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - AUTH VALIDATORS
// Zod validation schemas for authentication
// ══════════════════════════════════════════════════════════════════════════════

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Password Validation
// ─────────────────────────────────────────────────────────────────────────────

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// ─────────────────────────────────────────────────────────────────────────────
// Username Validation
// ─────────────────────────────────────────────────────────────────────────────

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

// ─────────────────────────────────────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  username: usernameSchema,
  displayName: z.string().min(1).max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Email Verification Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Password Management Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export const setPasswordSchema = z.object({
  password: passwordSchema,
})

// ─────────────────────────────────────────────────────────────────────────────
// Two-Factor Authentication Schemas (Bible: 02-USERS, 05-TECH)
// ─────────────────────────────────────────────────────────────────────────────

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .min(6, '2FA code must be at least 6 characters')
    .max(9, '2FA code must be at most 9 characters'),
})

export const twoFactorDisableSchema = z.object({
  code: z
    .string()
    .min(6, '2FA code is required')
    .max(9, 'Invalid 2FA code format'),
})

export const twoFactorRegenerateSchema = z.object({
  code: z
    .string()
    .min(6, '2FA code is required')
    .max(9, 'Invalid 2FA code format'),
})

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type SetPasswordInput = z.infer<typeof setPasswordSchema>
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>
export type TwoFactorRegenerateInput = z.infer<typeof twoFactorRegenerateSchema>
