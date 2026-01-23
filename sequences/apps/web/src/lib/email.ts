import { Resend } from 'resend';

// ============================================================================
// CONFIGURATION
// ============================================================================

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@sequences.app';
const APP_NAME = 'Sequences';

// ============================================================================
// TYPES
// ============================================================================

export type EmailResult =
  | { success: true; id: string }
  | { success: false; error: string };

type EmailLocale = 'en' | 'tr' | 'nl';

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const templates = {
  verificationCode: {
    en: {
      subject: 'Verify your email address',
      body: (code: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Verify your email</h1>
          <p>Use this verification code to complete your sign up:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    },
    tr: {
      subject: 'E-posta adresinizi doğrulayın',
      body: (code: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">E-postanızı doğrulayın</h1>
          <p>Kayıt işlemini tamamlamak için bu doğrulama kodunu kullanın:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
          <p style="color: #666; font-size: 14px;">Bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      `,
    },
    nl: {
      subject: 'Verifieer je e-mailadres',
      body: (code: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Verifieer je e-mail</h1>
          <p>Gebruik deze verificatiecode om je registratie te voltooien:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">Deze code verloopt over 10 minuten.</p>
          <p style="color: #666; font-size: 14px;">Als je dit niet hebt aangevraagd, kun je deze e-mail veilig negeren.</p>
        </div>
      `,
    },
  },
  welcomeEmail: {
    en: {
      subject: 'Welcome to Sequences!',
      body: (name: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome, ${name}!</h1>
          <p>Thank you for joining Sequences. We're excited to have you on board!</p>
          <p>Start capturing your life's moments and discover patterns in your emotional journey.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/storyboard" 
             style="display: inline-block; background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Get Started
          </a>
        </div>
      `,
    },
    tr: {
      subject: "Sequences'a Hoşgeldiniz!",
      body: (name: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hoşgeldiniz, ${name}!</h1>
          <p>Sequences'a katıldığınız için teşekkürler. Sizi aramızda görmekten mutluluk duyuyoruz!</p>
          <p>Hayatınızın anlarını kaydetmeye başlayın ve duygusal yolculuğunuzdaki kalıpları keşfedin.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/storyboard" 
             style="display: inline-block; background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Başla
          </a>
        </div>
      `,
    },
    nl: {
      subject: 'Welkom bij Sequences!',
      body: (name: string) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welkom, ${name}!</h1>
          <p>Bedankt voor je aanmelding bij Sequences. We zijn blij dat je erbij bent!</p>
          <p>Begin met het vastleggen van je levensmomenten en ontdek patronen in je emotionele reis.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/storyboard" 
             style="display: inline-block; background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Aan de slag
          </a>
        </div>
      `,
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateVerificationCode(): string {
  // Generate 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Send verification code email
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  locale: EmailLocale = 'en'
): Promise<EmailResult> {
  if (!resend) {
    console.log('Resend not configured. Verification code:', code);
    return { success: true, id: 'mock-id' };
  }

  const template = templates.verificationCode[locale] || templates.verificationCode.en;

  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: template.subject,
      html: template.body(code),
    });

    if (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id || 'unknown' };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  locale: EmailLocale = 'en'
): Promise<EmailResult> {
  if (!resend) {
    console.log('Resend not configured. Welcome email would be sent to:', email);
    return { success: true, id: 'mock-id' };
  }

  const template = templates.welcomeEmail[locale] || templates.welcomeEmail.en;

  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: template.subject,
      html: template.body(name),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id || 'unknown' };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!resend;
}

/**
 * Export the code generator for use in actions
 */
export { generateVerificationCode };
