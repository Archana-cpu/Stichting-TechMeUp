'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  Slider,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@seq/ui';
import {
  Edit,
  Check,
  X,
  Trash2,
  Plus,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  Heart,
} from 'lucide-react';
import type { Emotion, Trigger, Sequence, Note } from '@seq/database';
import { deleteSequence } from '@/app/actions';

type SequenceWithRelations = Sequence & {
  emotion: Emotion;
  trigger: Trigger;
  notes: Note[];
};

type SequenceDetailsProps = {
  sequence: SequenceWithRelations;
  emotions: Emotion[];
  triggers: Trigger[];
};

function calculatePolarity(sequence: SequenceWithRelations): number {
  const emotionScore = sequence.emotionPolarity * sequence.emotionIntensity;
  const thoughtScore = sequence.thoughtPolarity * sequence.thoughtIntensity;
  const behaviorScore = sequence.behaviorPolarity * sequence.behaviorImpact;
  return Math.round((emotionScore + thoughtScore + behaviorScore) / 3);
}

import { Brain, Target, Heart } from 'lucide-react';

type SectionCardProps = {
  title: string;
  icon: string | React.ComponentType<{ className?: string }>;
  content: string;
  intensity: number;
  polarity: number;
  intensityLabel: string;
  bgColor: string;
};

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '💭': Brain,
  '🎯': Target,
  '💜': Heart,
};

function SectionCard({ title, icon, content, intensity, polarity, intensityLabel, bgColor }: SectionCardProps) {
  const IconComponent = typeof icon === 'string' ? SECTION_ICONS[icon] || null : icon;
  
  return (
    <Card className="overflow-hidden border-2 border-border/50 vintage-card vintage-fade-in">
      <div className={`h-2 ${bgColor}`} />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {IconComponent ? (
            <IconComponent className="h-5 w-5 text-primary" />
          ) : typeof icon === 'string' ? (
            <span className="text-base">{icon}</span>
          ) : null}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <p className="text-sm italic leading-relaxed">{content}</p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">{intensityLabel}</span>
              <span className="font-semibold">{intensity}/10</span>
            </div>
            <Progress 
              value={intensity * 10} 
              className="h-2.5"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Polarity</span>
              <span className={`font-semibold ${polarity > 0 ? 'text-green-500' : polarity < 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {polarity > 0 ? '+' : ''}{polarity}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border/50">
              <div
                className={`h-full transition-all duration-300 ${
                  polarity > 0 ? 'bg-green-500' : polarity < 0 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (polarity + 50) * 2))}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SequenceDetails({ sequence, emotions, triggers }: SequenceDetailsProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const polarity = calculatePolarity(sequence);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSequence(sequence.id);
      if (result.success) {
        router.push(`/${locale}/storyboard`);
      } else {
        console.error('Failed to delete:', result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="h-10">
              <Link href="/storyboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-10"
              >
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl py-10 px-4">
        {/* Main Image */}
        {sequence.image && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-10 border-2 border-border/50 shadow-lg">
            <Image
              src={sequence.image}
              alt={sequence.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Title & Date */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl font-bold">{sequence.title}</h1>
          <div className="flex items-center justify-center gap-2.5 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-base">{new Date(sequence.eventDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Overall Polarity */}
        <Card className="mb-8 border-2 border-border/50 vintage-card">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-semibold">Overall Polarity</span>
              <div className="flex items-center gap-3">
                {polarity > 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : polarity < 0 ? (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                ) : (
                  <Minus className="h-6 w-6 text-blue-500" />
                )}
                <span className={`text-3xl font-bold ${
                  polarity > 0 ? 'text-green-500' : polarity < 0 ? 'text-red-500' : 'text-blue-500'
                }`}>
                  {polarity > 0 ? '+' : ''}{polarity}
                </span>
              </div>
            </div>
            <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden border border-border/50">
              <div
                className={`h-full transition-all duration-500 ${
                  polarity > 0 ? 'bg-green-500' : polarity < 0 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (polarity + 50) * 2))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trigger & Summary */}
        <Card className="mb-6 border-2 border-border/50 vintage-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{sequence.trigger.icon}</span>
              Trigger: {t(`triggers.${sequence.trigger.key}` as any)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-muted-foreground">{sequence.summary}</p>
          </CardContent>
        </Card>

        {/* Emotion, Thought, Behavior Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <SectionCard
            title="Emotion"
            icon={sequence.emotion.icon as string}
            content={t(`emotions.${sequence.emotion.key}` as any)}
            intensity={sequence.emotionIntensity}
            polarity={sequence.emotionPolarity}
            intensityLabel="Intensity"
            bgColor="bg-purple-500"
          />
          <SectionCard
            title="Thought"
            icon={Brain}
            content={sequence.thoughtContent}
            intensity={sequence.thoughtIntensity}
            polarity={sequence.thoughtPolarity}
            intensityLabel="Intensity"
            bgColor="bg-blue-500"
          />
          <SectionCard
            title="Behavior"
            icon={Target}
            content={sequence.behaviorContent}
            intensity={sequence.behaviorImpact}
            polarity={sequence.behaviorPolarity}
            intensityLabel="Impact"
            bgColor="bg-amber-500"
          />
        </div>

        {/* Notes */}
        {sequence.notes.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span>📋</span> Notes
            </h2>
            {sequence.notes.map((note, index) => (
              <Card key={note.id || index}>
                <CardContent className="pt-4">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sequence?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{sequence.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
