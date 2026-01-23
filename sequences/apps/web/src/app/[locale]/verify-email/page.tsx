'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
} from '@seq/ui';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { sendVerificationCode, verifyEmailCode } from '@/app/actions';

export default function VerifyEmailPage() {
  const router = useRouter();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendCode = () => {
    startTransition(async () => {
      setError('');
      const result = await sendVerificationCode();
      if (result.success) {
        setEmailSent(true);
      } else {
        setError(result.error || 'Failed to send verification email');
      }
    });
  };

  const handleVerify = () => {
    startTransition(async () => {
      setError('');
      const result = await verifyEmailCode({ code });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/storyboard`);
        }, 2000);
      } else {
        setError(result.error || 'Verification failed');
      }
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>Redirecting to storyboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We need to verify your email address before you can continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!emailSent ? (
            <Button onClick={handleSendCode} disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">
                A verification code has been sent to your email.
              </p>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button onClick={handleVerify} disabled={isPending || code.length !== 6} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>

              <Button variant="link" onClick={handleSendCode} disabled={isPending} className="w-full">
                Resend Code
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
