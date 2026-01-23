'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Progress,
  cn,
} from '@seq/ui';
import {
  Sparkles,
  User,
  Calendar,
  Image as ImageIcon,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  CheckCircle,
  XCircle,
  Palette,
  Type,
  Plus,
} from 'lucide-react';
import { colorPalettes, fontPairings, type ColorPaletteId, type FontPairingId } from '@seq/config/design-system';
import type { Emotion, Trigger } from '@seq/database';
import { updateProfile, checkUsernameAvailability, createSequence, sendInvitations, updateUserSettings } from '@/app/actions';

// ============================================================================
// PROPS
// ============================================================================

type OnboardingWizardProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  emotions: Emotion[];
  triggers: Trigger[];
};

// ============================================================================
// STEPS
// ============================================================================

type Step = 'welcome' | 'username' | 'profile' | 'preferences' | 'firstMemory' | 'invite' | 'complete';
const steps: Step[] = ['welcome', 'username', 'profile', 'preferences', 'firstMemory', 'invite', 'complete'];

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingWizard({ user, emotions, triggers }: OnboardingWizardProps) {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const tSeq = useTranslations('sequence');
  const tEmo = useTranslations('emotions');
  const tTrig = useTranslations('triggers');
  const router = useRouter();
  const locale = useLocale();

  // ============================================================================
  // STATE
  // ============================================================================

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isPending, startTransition] = useTransition();

  const { setTheme } = useTheme();
  
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<ColorPaletteId>('serenity');
  const [selectedFont, setSelectedFont] = useState<FontPairingId>('elegant');

  const [createFirstMemory, setCreateFirstMemory] = useState(false);
  const [firstMemory, setFirstMemory] = useState({
    title: '',
    summary: '',
    eventDate: '',
    emotionId: emotions[0]?.id || 1,
    triggerId: triggers[0]?.id || 1,
    thoughtContent: '',
    behaviorContent: '',
  });
  const [memoryImage, setMemoryImage] = useState<File | null>(null);
  const [memoryImagePreview, setMemoryImagePreview] = useState<string | null>(null);

  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);

  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // ============================================================================
  // USERNAME CHECK
  // ============================================================================

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const result = await checkUsernameAvailability(username);
        setUsernameStatus(result.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex] as Step);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex] as Step);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMemoryImage(file);
      setMemoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = () => {
    startTransition(async () => {
      try {
        // Save profile
        await updateProfile({
          username,
          birthday: birthday ? new Date(birthday) : undefined,
          bio: bio || undefined,
          onboardingComplete: true,
        });

        // Save theme and font preferences
        await updateUserSettings({
          theme: `dark-${selectedPalette}` as any,
          fontPairing: selectedFont,
        });
        
        // Apply theme immediately and persist to localStorage
        setTheme('dark');
        document.documentElement.setAttribute('data-palette', selectedPalette);
        document.documentElement.setAttribute('data-font', selectedFont);
        localStorage.setItem('seq-palette', selectedPalette);
        localStorage.setItem('seq-font', selectedFont);

        if (createFirstMemory && firstMemory.title) {
          let imageUrl = '';
          if (memoryImage) {
            const formData = new FormData();
            formData.append('image', memoryImage);
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            if (uploadRes.ok) {
              const data = await uploadRes.json();
              imageUrl = data.imageUrl;
            }
          }

          await createSequence({
            ...firstMemory,
            image: imageUrl || undefined,
            isPublic: false,
            emotionPolarity: 25,
            emotionIntensity: 8,
            thoughtPolarity: 25,
            thoughtIntensity: 8,
            behaviorPolarity: 25,
            behaviorImpact: 8,
          });
        }

        const validEmails = inviteEmails.filter((e) => e.includes('@'));
        if (validEmails.length > 0) {
          await sendInvitations({ emails: validEmails });
        }

        router.push(`/${locale}/storyboard`);
      } catch (error) {
        console.error('Onboarding error:', error);
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'username':
        return username.length >= 3 && usernameStatus === 'available';
      case 'firstMemory':
        return !createFirstMemory || (firstMemory.title && firstMemory.eventDate);
      default:
        return true;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-primary/5 via-background to-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>
      
      <Card className="w-full max-w-2xl vintage-card vintage-fade-in relative z-10 shadow-2xl depth-layer-3">
        {/* Enhanced decorative accents */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-br-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-accent/8 to-transparent rounded-bl-full pointer-events-none" />
        
        <CardHeader className="text-center pb-8 relative z-10">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/15 border-2 border-primary/30 shadow-2xl floating-element breathe">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold gradient-text mb-3">
            {t('welcome')}
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-lg font-medium">{t('welcomeDescription')}</p>
          <Progress value={progress} className="mt-8 h-3.5 shadow-inner border border-border/50 rounded-full" />
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Step: Welcome */}
          {currentStep === 'welcome' && (
            <div className="py-12 text-center space-y-4">
              <h2 className="text-2xl font-semibold flex items-center justify-center gap-3">
                <User className="h-6 w-6 text-primary" />
                Hey {user.name || 'there'}!
              </h2>
              <p className="text-muted-foreground text-base">
                Let's set up your account and get you started on your journey.
              </p>
            </div>
          )}

          {/* Step: Username */}
          {currentStep === 'username' && (
            <div className="space-y-7">
              <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-6 border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift vintage-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/20">
                  <User className="h-6 w-6 text-primary shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('step1Title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{t('step1Description')}</p>
                </div>
              </div>

              <div className="form-group space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Username
                </Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium group-focus-within:text-primary transition-colors">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder={t('usernamePlaceholder')}
                    className="pl-10 h-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    {usernameStatus === 'available' && <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />}
                    {usernameStatus === 'taken' && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
                {usernameStatus === 'available' && (
                  <p className="text-sm text-green-500 font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    {t('usernameAvailable')}
                  </p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-sm text-red-500 font-medium flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    {t('usernameTaken')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {currentStep === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{t('step2Title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('step2Description')}</p>
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="birthday" className="text-sm font-semibold mb-2">{t('birthdayLabel')}</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="h-11 border-2 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="bio" className="text-sm font-semibold mb-2">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="border-2 focus:border-primary/50 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step: Preferences (Palette & Font) */}
          {currentStep === 'preferences' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 rounded-xl bg-muted/40 p-5 border border-border/50">
                <Palette className="h-8 w-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-semibold text-base">Personalize Your Experience</h3>
                  <p className="text-sm text-muted-foreground mt-1">Choose your color palette and typography</p>
                </div>
              </div>

              {/* Palette Selection */}
              <div className="form-section space-y-5">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Palette className="h-4 w-4 text-primary" />
                  Color Palette
                </Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(Object.entries(colorPalettes) as [ColorPaletteId, typeof colorPalettes.serenity][]).map(([id, palette]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedPalette(id);
                        document.documentElement.setAttribute('data-palette', id);
                      }}
                      className={cn(
                        'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all duration-300 hover-lift interactive-scale',
                        selectedPalette === id
                          ? 'border-primary bg-primary/15 shadow-xl ring-4 ring-primary/20 scale-105 glow-pulse'
                          : 'border-border/50 hover:border-primary/40 bg-card/60 hover:bg-card/80'
                      )}
                    >
                      <div className="flex gap-1.5">
                        {(palette.preview || []).map((color, i) => (
                          <div
                            key={i}
                            className="h-7 w-7 rounded-full ring-2 ring-background/50 shadow-sm group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold">{palette.name}</span>
                      {selectedPalette === id && (
                        <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1 shadow-lg animate-pulse">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div className="form-section space-y-5">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Type className="h-4 w-4 text-primary" />
                  Typography Style
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(fontPairings) as [FontPairingId, typeof fontPairings.elegant][]).map(([id, font]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedFont(id);
                        document.documentElement.setAttribute('data-font', id);
                      }}
                      className={cn(
                        'relative flex flex-col gap-3 rounded-xl border-2 p-6 text-left transition-all duration-300 hover-lift interactive-scale',
                        selectedFont === id
                          ? 'border-primary bg-primary/15 shadow-xl ring-4 ring-primary/20 scale-[1.02] glow-pulse'
                          : 'border-border/50 hover:border-primary/40 bg-card/60 hover:bg-card/80'
                      )}
                    >
                      <span className="font-heading text-xl font-bold" style={{ fontFamily: font.heading }}>
                        {font.name}
                      </span>
                      <span className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: font.body }}>
                        {font.name}
                      </span>
                      {selectedFont === id && (
                        <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1 shadow-lg animate-pulse">
                          <Check className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preview */}
              <div className="flex items-center justify-center gap-4 rounded-xl border-2 border-border/50 bg-muted/30 p-6 vintage-card">
                <Button variant="default" size="sm" className="hover-lift">Preview Button</Button>
                <Button variant="outline" size="sm" className="hover-lift">Secondary</Button>
                <div className="rounded-lg bg-card border-2 border-border/50 px-4 py-2.5 text-sm font-medium shadow-sm">
                  Sample Card
                </div>
              </div>
            </div>
          )}

          {/* Step: First Memory */}
          {currentStep === 'firstMemory' && (
            <div className="space-y-7">
              <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-6 border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift vintage-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/20">
                  <ImageIcon className="h-6 w-6 text-primary shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('step3Title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{t('step3Description')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant={createFirstMemory ? 'default' : 'outline'}
                  onClick={() => setCreateFirstMemory(true)}
                  className="h-12 px-8 font-semibold hover-lift interactive-scale shadow-md hover:shadow-lg"
                >
                  Create a memory
                </Button>
                <Button
                  variant={!createFirstMemory ? 'default' : 'outline'}
                  onClick={() => setCreateFirstMemory(false)}
                  className="h-12 px-8 font-semibold hover-lift interactive-scale shadow-md hover:shadow-lg"
                >
                  {t('skipForNow')}
                </Button>
              </div>

              {createFirstMemory && (
                <div className="form-section space-y-5 rounded-xl border-2 border-border/50 bg-card/50 p-6">
                  <div className="form-group">
                    <Label className="text-sm font-semibold mb-2">{tSeq('title')}</Label>
                    <Input
                      value={firstMemory.title}
                      onChange={(e) => setFirstMemory({ ...firstMemory, title: e.target.value })}
                      placeholder="My first memory..."
                      className="h-11 border-2 focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="form-group">
                    <Label className="text-sm font-semibold mb-2">{tSeq('eventDate')}</Label>
                    <Input
                      type="date"
                      value={firstMemory.eventDate}
                      onChange={(e) => setFirstMemory({ ...firstMemory, eventDate: e.target.value })}
                      className="h-11 border-2 focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="form-group">
                    <Label className="text-sm font-semibold mb-2">{tSeq('summary')}</Label>
                    <Textarea
                      value={firstMemory.summary}
                      onChange={(e) => setFirstMemory({ ...firstMemory, summary: e.target.value })}
                      placeholder="What happened..."
                      rows={4}
                      className="border-2 focus:border-primary/50 transition-all resize-none"
                    />
                  </div>

                  <div className="form-group">
                    <Label className="text-sm font-semibold mb-2">Image</Label>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="h-11 border-2 focus:border-primary/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {memoryImagePreview && (
                      <img src={memoryImagePreview} alt="Preview" className="mt-4 h-40 w-40 rounded-xl object-cover border-2 border-border/50 shadow-md" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Invite */}
          {currentStep === 'invite' && (
            <div className="space-y-7">
              <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-6 border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift vintage-card">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/20">
                  <Users className="h-6 w-6 text-primary shrink-0" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('step4Title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{t('step4Description')}</p>
                </div>
              </div>

              {inviteEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...inviteEmails];
                      newEmails[index] = e.target.value;
                      setInviteEmails(newEmails);
                    }}
                    placeholder="friend@email.com"
                    className="h-11 border-2 focus:border-primary/50 transition-all flex-1"
                  />
                  {index === inviteEmails.length - 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setInviteEmails([...inviteEmails, ''])}
                      className="h-11 w-11"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}

              <Button variant="link" onClick={() => setInviteEmails([''])} className="text-sm">
                {t('inviteLater')}
              </Button>
            </div>
          )}

          {/* Step: Complete */}
          {currentStep === 'complete' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/20">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold">You're all set!</h2>
              <p className="text-muted-foreground text-base">
                Your account is ready. Let's start your journey.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t-2 border-border/50 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="h-12 px-8 font-semibold hover-lift interactive-scale border-2"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {tCommon('back')}
            </Button>

            {currentStep === 'complete' ? (
              <Button 
                onClick={handleComplete} 
                disabled={isPending} 
                className="h-12 px-8 font-semibold hover-lift interactive-scale shadow-lg hover:shadow-xl glow-pulse"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    {t('letsGo')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                disabled={!canProceed()} 
                className="h-12 px-8 font-semibold hover-lift interactive-scale shadow-md hover:shadow-lg"
              >
                {tCommon('next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
