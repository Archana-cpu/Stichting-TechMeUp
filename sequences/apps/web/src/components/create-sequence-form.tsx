'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@seq/ui';
import { ChevronRight, ChevronLeft, Check, Plus, X, Sparkles, Calendar, Image as ImageIcon, Users, FileText, Zap, Heart, Brain, Target, StickyNote } from 'lucide-react';
import type { Emotion, Trigger, Person } from '@seq/database';

import { EmotionPicker } from './emotions';
import { PolaritySlider, IntensitySlider } from './polarity';
import { createSequence } from '@/app/actions';

type CreateSequenceFormProps = {
  emotions: Emotion[];
  triggers: Trigger[];
  people: Person[];
};

type FormStep = {
  id: string;
  titleKey: string;
  icon: any;
};

const STEPS: FormStep[] = [
  { id: 'basic', titleKey: 'basic', icon: FileText },
  { id: 'trigger', titleKey: 'trigger', icon: Zap },
  { id: 'emotion', titleKey: 'emotion', icon: Heart },
  { id: 'thought', titleKey: 'thought', icon: Brain },
  { id: 'behavior', titleKey: 'behavior', icon: Target },
  { id: 'notes', titleKey: 'notes', icon: StickyNote },
];

const STEP_ICONS: Record<string, any> = {
  FileText,
  Zap,
  Heart,
  Brain,
  Target,
  StickyNote,
};

export function CreateSequenceForm({ emotions, triggers, people }: CreateSequenceFormProps) {
  const t = useTranslations('sequence');
  const tCommon = useTranslations('common');
  const tTriggers = useTranslations('triggers');
  const router = useRouter();
  const locale = useLocale();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    eventDate: new Date().toISOString().split('T')[0],
    isPublic: false,
    isCoreMemory: false,
    triggerId: '',
    emotionId: '',
    emotionPolarity: 0,
    emotionIntensity: 5,
    thoughtContent: '',
    thoughtPolarity: 0,
    thoughtIntensity: 5,
    behaviorContent: '',
    behaviorPolarity: 0,
    behaviorImpact: 5,
    notes: [{ content: '', date: new Date().toISOString().split('T')[0] }],
    peopleIds: [] as string[],
  });

  const selectedEmotion = useMemo(
    () => emotions.find((e) => e.id === Number(formData.emotionId)),
    [emotions, formData.emotionId]
  );

  const selectedTrigger = useMemo(
    () => triggers.find((t) => t.id === Number(formData.triggerId)),
    [triggers, formData.triggerId]
  );

  const stepTitles: Record<string, string> = {
    basic: t('title'),
    trigger: t('trigger'),
    emotion: t('emotion'),
    thought: t('thought'),
    behavior: t('behavior'),
    notes: t('notes'),
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddNote = () => {
    setFormData({
      ...formData,
      notes: [...formData.notes, { content: '', date: new Date().toISOString().split('T')[0] }],
    });
  };

  const handleDeleteNote = (index: number) => {
    if (formData.notes.length > 1) {
      const newNotes = [...formData.notes];
      newNotes.splice(index, 1);
      setFormData({ ...formData, notes: newNotes });
    }
  };

  const handleNoteChange = (index: number, content: string) => {
    const newNotes = [...formData.notes];
    if (newNotes[index]) {
      newNotes[index] = { content, date: new Date().toISOString().split('T')[0] };
      setFormData({ ...formData, notes: newNotes });
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        let imageUrl = '';

        if (imageFile) {
          const uploadFormData = new FormData();
          uploadFormData.append('image', imageFile);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            imageUrl = data.imageUrl;
          }
        }

        const result = await createSequence({
          ...formData,
          eventDate: formData.eventDate ? new Date(formData.eventDate) : new Date(),
          triggerId: Number(formData.triggerId),
          emotionId: Number(formData.emotionId),
          image: imageUrl || undefined,
        });

        if (result.success) {
          router.push(`/${locale}/storyboard`);
        } else {
          const errorMessage = result.error || result.code || 'Unknown error';
          console.error('Failed to create sequence:', errorMessage, result);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error) || 'Unknown error';
        console.error('Failed to create sequence:', errorMessage, error);
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title.trim() !== '' && formData.summary.trim() !== '' && formData.eventDate !== '';
      case 1:
        return formData.triggerId !== '';
      case 2:
        return formData.emotionId !== '';
      case 3:
        return formData.thoughtContent.trim() !== '';
      case 4:
        return formData.behaviorContent.trim() !== '';
      default:
        return true;
    }
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen py-8 md:py-12 relative overflow-hidden md:ml-16">
      {/* Subtle background light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>
      
      <div className="container max-w-2xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold">
            {t('newSequence')}
          </h1>
          <p className="text-muted-foreground">Record your emotional experience</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8 relative">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative z-10">
                {index < STEPS.length - 1 && (
                  <div className={`absolute top-1/2 left-full w-4 h-0.5 transition-all duration-300 ${
                    index < currentStep ? 'bg-primary' : 'bg-border'
                  }`} style={{ transform: 'translateX(50%)' }} />
                )}
                
                <button
                  type="button"
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : index < currentStep
                      ? 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30 border border-primary/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Card className="shadow-lg border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              {(() => {
                const Icon = STEPS[currentStep]?.icon;
                return Icon ? (
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                ) : null;
              })()}
              {stepTitles[STEPS[currentStep]?.id || 'basic']}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    {t('title')} *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Give your sequence a title..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary" className="text-sm font-medium">
                    {t('summary')} *
                  </Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Describe what happened..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-sm font-medium">
                    {t('eventDate')} *
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Image (optional)
                  </Label>
                  {imagePreview ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 rounded-md bg-background/95 hover:bg-background border shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">{tCommon('upload')}</span>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{t('isPublic')}</Label>
                      <p className="text-xs text-muted-foreground">Share publicly</p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">{t('coreMemory')}</Label>
                      <p className="text-xs text-muted-foreground">Significant memory</p>
                    </div>
                    <Switch
                      checked={formData.isCoreMemory}
                      onCheckedChange={(checked) => setFormData({ ...formData, isCoreMemory: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    What triggered this event? *
                  </Label>
                  <Select
                    value={formData.triggerId}
                    onValueChange={(v) => setFormData({ ...formData, triggerId: v })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a trigger..." />
                    </SelectTrigger>
                    <SelectContent>
                      {triggers.map((trigger) => (
                        <SelectItem key={trigger.id} value={String(trigger.id)}>
                          <span className="flex items-center gap-2">
                            <span>{trigger.icon}</span>
                            <span>{tTriggers(trigger.key as any)}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTrigger && (
                  <Card className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br bg-primary/10">
                          <span className="text-2xl">{selectedTrigger.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{tTriggers(selectedTrigger.key as any)}</p>
                          <p className="text-sm text-muted-foreground">Selected trigger</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <EmotionPicker
                emotions={emotions}
                selectedId={formData.emotionId ? Number(formData.emotionId) : undefined}
                onSelect={(id) => setFormData({ ...formData, emotionId: String(id) })}
                showIntensitySlider
                intensity={formData.emotionIntensity}
                onIntensityChange={(v) => setFormData({ ...formData, emotionIntensity: v })}
                polarity={formData.emotionPolarity}
                onPolarityChange={(v) => setFormData({ ...formData, emotionPolarity: v })}
              />
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="thought" className="text-sm font-medium">
                    {t('thought')} *
                  </Label>
                  <Textarea
                    id="thought"
                    value={formData.thoughtContent}
                    onChange={(e) => setFormData({ ...formData, thoughtContent: e.target.value })}
                    placeholder="Describe your thoughts during this event..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IntensitySlider
                    value={formData.thoughtIntensity}
                    onChange={(v) => setFormData({ ...formData, thoughtIntensity: v })}
                    label={`${t('thought')} ${t('intensity')}`}
                  />

                  <PolaritySlider
                    value={formData.thoughtPolarity}
                    onChange={(v) => setFormData({ ...formData, thoughtPolarity: v })}
                    label={`${t('thought')} ${t('polarity')}`}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="behavior" className="text-sm font-medium">
                    {t('behavior')} *
                  </Label>
                  <Textarea
                    id="behavior"
                    value={formData.behaviorContent}
                    onChange={(e) => setFormData({ ...formData, behaviorContent: e.target.value })}
                    placeholder="Describe your actions and reactions..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <IntensitySlider
                    value={formData.behaviorImpact}
                    onChange={(v) => setFormData({ ...formData, behaviorImpact: v })}
                    label={`${t('behavior')} ${t('impact')}`}
                  />

                  <PolaritySlider
                    value={formData.behaviorPolarity}
                    onChange={(v) => setFormData({ ...formData, behaviorPolarity: v })}
                    label={`${t('behavior')} ${t('polarity')}`}
                  />
                </div>

                {people.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('linkedPeople')}
                    </Label>
                    <Select
                      value={formData.peopleIds[0] || ''}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          peopleIds: v ? [...formData.peopleIds, v] : formData.peopleIds,
                        })
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t('addPeople')} />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="form-section space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    {t('notes')} (optional)
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddNote} className="hover-lift">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addNote')}
                  </Button>
                </div>
                <div className="space-y-5">
                  {formData.notes.map((note, index) => (
                    <div key={index} className="form-group p-5 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/20 transition-all">
                      <Textarea
                        value={note.content}
                        onChange={(e) => handleNoteChange(index, e.target.value)}
                        placeholder={`${t('notes')} ${index + 1}`}
                        rows={4}
                        className="text-base leading-relaxed"
                      />
                      {index > 0 && (
                        <div className="flex justify-end mt-3">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNote(index)}
                            className="hover-lift"
                          >
                            <X className="mr-1 h-3 w-3" />
                            {tCommon('delete')}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t-2 border-border/30 mt-8 gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="h-12 px-8 rounded-xl border-2 hover-lift vintage-button"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                <span className="font-semibold">{tCommon('back')}</span>
              </Button>
              {currentStep === STEPS.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isPending}
                  className="h-12 px-10 rounded-xl shadow-xl hover:shadow-2xl hover-lift vintage-button bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Check className="mr-2 h-5 w-5" />
                  <span className="font-semibold text-base">
                    {isPending ? tCommon('loading') : tCommon('create')}
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
                  disabled={!canProceed()}
                  className="h-12 px-10 rounded-xl shadow-lg hover:shadow-xl hover-lift vintage-button"
                >
                  <span className="font-semibold text-base">{tCommon('next')}</span>
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
