// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL API - EMAIL SERVICE
// ══════════════════════════════════════════════════════════════════════════════

// Email service interface for sending transactional emails
// Can be implemented with various providers (Resend, SendGrid, Postmark, etc.)

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export interface EmailService {
  send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }>
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────────────────────────────────────

export const emailTemplates = {
  verificationCode: (code: string, expiresInMinutes: number = 15) => ({
    subject: 'VoxPoll - Email Verification Code',
    text: `Your verification code is: ${code}\n\nThis code will expire in ${expiresInMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #333; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; margin-top: 20px;">This code will expire in ${expiresInMinutes} minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  }),

  passwordReset: (resetUrl: string, expiresInMinutes: number = 60) => ({
    subject: 'VoxPoll - Password Reset Request',
    text: `Click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in ${expiresInMinutes} minutes.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">Or copy and paste this link into your browser:</p>
        <p style="color: #007bff; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; margin-top: 20px;">This link will expire in ${expiresInMinutes} minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  passwordChanged: () => ({
    subject: 'VoxPoll - Password Changed',
    text: 'Your password has been successfully changed.\n\nIf you did not make this change, please contact support immediately.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed</h2>
        <p>Your password has been successfully changed.</p>
        <p style="color: #d32f2f; margin-top: 20px;">If you did not make this change, please contact support immediately.</p>
      </div>
    `,
  }),

  welcomeEmail: (username: string) => ({
    subject: 'Welcome to VoxPoll!',
    text: `Welcome to VoxPoll, ${username}!\n\nThank you for joining our community. Start creating polls, taking surveys, and sharing your opinions with the world.\n\nHappy polling!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to VoxPoll!</h2>
        <p>Hello <strong>${username}</strong>,</p>
        <p>Thank you for joining our community. Start creating polls, taking surveys, and sharing your opinions with the world.</p>
        <p style="margin-top: 30px;">Happy polling!</p>
        <p style="color: #666;">The VoxPoll Team</p>
      </div>
    `,
  }),

  organizationInvite: (orgName: string, inviterName: string, role: string, inviteUrl: string, expiresInDays: number = 7) => ({
    subject: `VoxPoll - You've been invited to join ${orgName}`,
    text: `${inviterName} has invited you to join ${orgName} on VoxPoll as a ${role}.\n\nClick the following link to accept the invitation:\n${inviteUrl}\n\nThis invitation will expire in ${expiresInDays} days.\n\nIf you didn't expect this invitation, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're Invited!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on VoxPoll.</p>
        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333;">Role: <strong>${role}</strong></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #666;">Or copy and paste this link into your browser:</p>
        <p style="color: #007bff; word-break: break-all;">${inviteUrl}</p>
        <p style="color: #666; margin-top: 20px;">This invitation will expire in ${expiresInDays} days.</p>
        <p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
  }),

  subscriptionConfirmed: (planName: string, amount: string, billingCycle: string, nextBillingDate: string) => ({
    subject: 'VoxPoll - Subscription Confirmed',
    text: `Thank you for subscribing to VoxPoll ${planName}!\n\nPlan: ${planName}\nAmount: ${amount}/${billingCycle}\nNext billing date: ${nextBillingDate}\n\nYou now have access to all premium features. Thank you for supporting VoxPoll!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Subscription Confirmed!</h2>
        <p>Thank you for subscribing to VoxPoll <strong>${planName}</strong>!</p>
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #166534;">Subscription Details</h3>
          <p style="margin: 5px 0; color: #333;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> ${amount}/${billingCycle}</p>
          <p style="margin: 5px 0; color: #333;"><strong>Next billing date:</strong> ${nextBillingDate}</p>
        </div>
        <p>You now have access to all premium features. Thank you for supporting VoxPoll!</p>
        <p style="color: #666; margin-top: 30px;">The VoxPoll Team</p>
      </div>
    `,
  }),

  subscriptionCanceled: (planName: string, endDate: string) => ({
    subject: 'VoxPoll - Subscription Canceled',
    text: `Your VoxPoll ${planName} subscription has been canceled.\n\nYou will continue to have access to premium features until ${endDate}.\n\nWe're sorry to see you go! If you change your mind, you can always resubscribe from your account settings.\n\nIf you have any feedback, we'd love to hear from you.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Subscription Canceled</h2>
        <p>Your VoxPoll <strong>${planName}</strong> subscription has been canceled.</p>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            You will continue to have access to premium features until <strong>${endDate}</strong>.
          </p>
        </div>
        <p>We're sorry to see you go! If you change your mind, you can always resubscribe from your account settings.</p>
        <p style="color: #666; margin-top: 20px;">If you have any feedback about your experience, we'd love to hear from you.</p>
        <p style="color: #666; margin-top: 30px;">The VoxPoll Team</p>
      </div>
    `,
  }),

  paymentFailed: (amount: string, retryDate: string, updatePaymentUrl: string) => ({
    subject: 'VoxPoll - Payment Failed',
    text: `We were unable to process your payment of ${amount}.\n\nWe will automatically retry on ${retryDate}. To avoid any service interruption, please update your payment method.\n\nUpdate payment method: ${updatePaymentUrl}\n\nIf you have any questions, please contact our support team.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Failed</h2>
        <p>We were unable to process your payment.</p>
        <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>Amount:</strong> ${amount}</p>
          <p style="margin: 0; color: #991b1b;">We will automatically retry on <strong>${retryDate}</strong>.</p>
        </div>
        <p>To avoid any service interruption, please update your payment method:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${updatePaymentUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </div>
        <p style="color: #666;">If you have any questions, please contact our support team.</p>
        <p style="color: #666; margin-top: 30px;">The VoxPoll Team</p>
      </div>
    `,
  }),

  pollEnded: (pollTitle: string, totalVotes: number, resultsUrl: string) => ({
    subject: `VoxPoll - Your poll "${pollTitle}" has ended`,
    text: `Your poll "${pollTitle}" has ended!\n\nTotal votes received: ${totalVotes}\n\nView the results: ${resultsUrl}\n\nThank you for using VoxPoll!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Poll Ended</h2>
        <p>Your poll <strong>"${pollTitle}"</strong> has ended!</p>
        <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 24px; color: #1e40af;"><strong>${totalVotes}</strong></p>
          <p style="margin: 5px 0 0 0; color: #666;">total votes received</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resultsUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Results
          </a>
        </div>
        <p style="color: #666;">Thank you for using VoxPoll!</p>
      </div>
    `,
  }),

  weeklyDigest: (username: string, pollsCreated: number, totalVotes: number, newFollowers: number) => ({
    subject: 'VoxPoll - Your Weekly Activity Summary',
    text: `Hi ${username}!\n\nHere's your weekly activity summary:\n\n- Polls created: ${pollsCreated}\n- Total votes received: ${totalVotes}\n- New followers: ${newFollowers}\n\nKeep up the great work!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Weekly Summary</h2>
        <p>Hi <strong>${username}</strong>!</p>
        <p>Here's your activity summary for the past week:</p>
        <div style="display: flex; gap: 15px; margin: 20px 0;">
          <div style="flex: 1; background: #f0f7ff; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 28px; color: #1e40af; font-weight: bold;">${pollsCreated}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Polls Created</p>
          </div>
          <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 28px; color: #166534; font-weight: bold;">${totalVotes}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Votes Received</p>
          </div>
          <div style="flex: 1; background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 28px; color: #92400e; font-weight: bold;">${newFollowers}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">New Followers</p>
          </div>
        </div>
        <p style="color: #666;">Keep up the great work!</p>
        <p style="color: #666; margin-top: 30px;">The VoxPoll Team</p>
      </div>
    `,
  }),

  accountWarning: (reason: string, actionRequired: string) => ({
    subject: 'VoxPoll - Account Warning',
    text: `Your VoxPoll account has received a warning.\n\nReason: ${reason}\n\n${actionRequired}\n\nPlease review our community guidelines to avoid further action on your account.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Warning</h2>
        <p>Your VoxPoll account has received a warning.</p>
        <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #991b1b;"><strong>Reason:</strong></p>
          <p style="margin: 0; color: #333;">${reason}</p>
        </div>
        <p><strong>Action Required:</strong></p>
        <p>${actionRequired}</p>
        <p style="color: #666; margin-top: 20px;">Please review our community guidelines to avoid further action on your account.</p>
      </div>
    `,
  }),
}

// ─────────────────────────────────────────────────────────────────────────────
// Console Email Service (Development)
// Logs emails to console instead of sending
// ─────────────────────────────────────────────────────────────────────────────

class ConsoleEmailService implements EmailService {
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    console.log('\n' + '═'.repeat(60))
    console.log('📧 EMAIL (Development Mode)')
    console.log('═'.repeat(60))
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('─'.repeat(60))
    console.log(options.text || 'No text content')
    console.log('═'.repeat(60) + '\n')

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resend Email Service (Production)
// Uses Resend API for sending emails
// ─────────────────────────────────────────────────────────────────────────────

// Email service configuration
const EMAIL_CONFIG = {
  timeout: 10000, // 10 second timeout
  maxRetries: 3,
  retryDelayMs: 1000, // 1 second base delay
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class ResendEmailService implements EmailService {
  private apiKey: string
  private fromAddress: string

  constructor() {
    this.apiKey = process.env['RESEND_API_KEY'] || ''
    this.fromAddress = process.env['EMAIL_FROM'] || 'noreply@voxpoll.com'
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey) {
      console.error('RESEND_API_KEY is not configured')
      return { success: false }
    }

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= EMAIL_CONFIG.maxRetries; attempt++) {
      try {
        const result = await this.sendWithTimeout(options)
        return result
      } catch (error) {
        lastError = error as Error

        // Check if it's a retryable error
        const isRetryable = this.isRetryableError(error)
        const isLastAttempt = attempt === EMAIL_CONFIG.maxRetries

        if (!isRetryable || isLastAttempt) {
          console.error(`[Email] Failed after ${attempt} attempt(s):`, error)
          return { success: false }
        }

        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = EMAIL_CONFIG.retryDelayMs * Math.pow(2, attempt - 1)
        console.warn(`[Email] Attempt ${attempt} failed, retrying in ${backoffDelay}ms...`)
        await delay(backoffDelay)
      }
    }

    console.error('[Email] All retry attempts exhausted:', lastError)
    return { success: false }
  }

  private async sendWithTimeout(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), EMAIL_CONFIG.timeout)

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromAddress,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const error = await response.text()
        // Throw error with status code for retry logic
        const err = new Error(`HTTP ${response.status}: ${error}`)
        ;(err as Error & { statusCode: number }).statusCode = response.status
        throw err
      }

      const data = await response.json() as { id: string }
      return {
        success: true,
        messageId: data.id,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private isRetryableError(error: unknown): boolean {
    // Timeout errors are retryable
    if (error instanceof Error && error.name === 'AbortError') {
      return true
    }

    // Network errors are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true
    }

    // Check for retryable HTTP status codes
    const statusCode = (error as Error & { statusCode?: number }).statusCode
    if (statusCode && EMAIL_CONFIG.retryableStatusCodes.includes(statusCode)) {
      return true
    }

    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Service Factory
// ─────────────────────────────────────────────────────────────────────────────

let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    if (process.env['NODE_ENV'] === 'production' && process.env['RESEND_API_KEY']) {
      emailServiceInstance = new ResendEmailService()
    } else {
      emailServiceInstance = new ConsoleEmailService()
    }
  }
  return emailServiceInstance
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  const template = emailTemplates.verificationCode(code)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const template = emailTemplates.passwordReset(resetUrl)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  const template = emailTemplates.passwordChanged()
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const template = emailTemplates.welcomeEmail(username)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendOrganizationInvite(
  email: string,
  orgName: string,
  inviterName: string,
  role: string,
  inviteUrl: string
): Promise<boolean> {
  const template = emailTemplates.organizationInvite(orgName, inviterName, role, inviteUrl)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendSubscriptionConfirmed(
  email: string,
  planName: string,
  amount: string,
  billingCycle: string,
  nextBillingDate: string
): Promise<boolean> {
  const template = emailTemplates.subscriptionConfirmed(planName, amount, billingCycle, nextBillingDate)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendSubscriptionCanceled(
  email: string,
  planName: string,
  endDate: string
): Promise<boolean> {
  const template = emailTemplates.subscriptionCanceled(planName, endDate)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendPaymentFailed(
  email: string,
  amount: string,
  retryDate: string,
  updatePaymentUrl: string
): Promise<boolean> {
  const template = emailTemplates.paymentFailed(amount, retryDate, updatePaymentUrl)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendPollEnded(
  email: string,
  pollTitle: string,
  totalVotes: number,
  resultsUrl: string
): Promise<boolean> {
  const template = emailTemplates.pollEnded(pollTitle, totalVotes, resultsUrl)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendWeeklyDigest(
  email: string,
  username: string,
  pollsCreated: number,
  totalVotes: number,
  newFollowers: number
): Promise<boolean> {
  const template = emailTemplates.weeklyDigest(username, pollsCreated, totalVotes, newFollowers)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}

export async function sendAccountWarning(
  email: string,
  reason: string,
  actionRequired: string
): Promise<boolean> {
  const template = emailTemplates.accountWarning(reason, actionRequired)
  const result = await getEmailService().send({
    to: email,
    ...template,
  })
  return result.success
}
