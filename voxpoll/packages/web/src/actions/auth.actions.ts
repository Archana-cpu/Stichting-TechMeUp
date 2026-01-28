'use server'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - AUTH SERVER ACTIONS
// Next.js 16 Server Actions with type-safe @voxpoll/api client
// ══════════════════════════════════════════════════════════════════════════════

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getServerClient, setAuthCookies, clearAuthCookies } from '@/lib/api'
import type { RegisterInput, LoginInput } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─────────────────────────────────────────────────────────────────────────────
// Register Action
// ─────────────────────────────────────────────────────────────────────────────

export async function registerAction(
  _prevState: ActionResult<{ message: string }>,
  formData: FormData
): Promise<ActionResult<{ message: string }>> {
  try {
    const api = await getServerClient()

    const input: RegisterInput = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      username: formData.get('username') as string,
      displayName: (formData.get('displayName') as string) || undefined,
    }

    const result = await api.auth.register(input)

    return {
      success: true,
      data: { message: result.message },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Login Action
// ─────────────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const api = await getServerClient()

    const input: LoginInput = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const result = await api.auth.login(input)

    // Set auth cookies
    await setAuthCookies(result.session)

    // Redirect to dashboard
    redirect('/dashboard')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logout Action
// ─────────────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  try {
    const api = await getServerClient()
    await api.auth.logout()
  } catch {
    // Ignore errors - still clear cookies
  } finally {
    await clearAuthCookies()
    redirect('/auth/login')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Current User Action
// ─────────────────────────────────────────────────────────────────────────────

export async function getCurrentUserAction() {
  try {
    const api = await getServerClient()
    const user = await api.auth.me()
    return { success: true, data: user }
  } catch {
    return { success: false, data: null }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify Email Action
// ─────────────────────────────────────────────────────────────────────────────

export async function verifyEmailAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    const code = formData.get('code') as string

    await api.auth.verifyEmail(code)
    revalidatePath('/dashboard')

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resend Verification Code Action
// ─────────────────────────────────────────────────────────────────────────────

export async function resendVerificationAction(): Promise<ActionResult<{ expiresAt: string }>> {
  try {
    const api = await getServerClient()
    const result = await api.auth.sendVerificationCode()

    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send code',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Forgot Password Action
// ─────────────────────────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    const email = formData.get('email') as string

    await api.auth.forgotPassword(email)

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reset email',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password Action
// ─────────────────────────────────────────────────────────────────────────────

export async function resetPasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    const token = formData.get('token') as string
    const password = formData.get('password') as string

    await api.auth.resetPassword(token, password)

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset password',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Change Password Action
// ─────────────────────────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    await api.auth.changePassword(currentPassword, newPassword)

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password',
    }
  }
}
